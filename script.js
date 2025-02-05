const apiKey = "4144ec21e5ac6f1ab3e15a226349e098";

document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.getElementById("searchForm");
    const cityInput = document.getElementById("cityInput");
    const weatherInfo = document.getElementById("weatherInfo");

    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const city = cityInput.value.trim();
        if (city) {
            getWeather(city);
        }
    });

    function getWeatherEmoji(description) {
        const weatherIcons = {
            "cielo claro": "☀️",
            "algo de nubes": "🌤️",
            "nubes dispersas": "⛅",
            "muy nuboso": "🌥️",
            "nublado": "☁️",
            "lluvia ligera": "🌦️",
            "lluvia moderada": "🌧️",
            "lluvia intensa": "⛈️",
            "tormenta con lluvia": "⛈️",
            nieve: "❄️",
            niebla: "🌫️",
            tornado: "🌪️",
        };
        return weatherIcons[description] || "❓";
    }

    function getMoonPhase(date) {
        const lunarCycle = 29.53;
        const knownNewMoon = new Date("2000-01-06");
        const daysSinceNewMoon = (date - knownNewMoon) / (1000 * 60 * 60 * 24);
        const phase = (daysSinceNewMoon % lunarCycle) / lunarCycle;

        if (phase < 0.125) return "new";
        else if (phase < 0.25) return "waxing_crescent";
        else if (phase < 0.375) return "first_quarter";
        else if (phase < 0.5) return "waxing_gibbous";
        else if (phase < 0.625) return "full";
        else if (phase < 0.75) return "waning_gibbous";
        else if (phase < 0.875) return "last_quarter";
        else return "waning_crescent";
    }

    function getMoonEmoji(phase) {
        const moonEmojis = {
            new: "🌑",
            waxing_crescent: "🌒",
            first_quarter: "🌓",
            waxing_gibbous: "🌔",
            full: "🌕",
            waning_gibbous: "🌖",
            last_quarter: "🌗",
            waning_crescent: "🌘",
        };
        return moonEmojis[phase] || "🌑";
    }

    function isNight(sunrise, sunset, currentTime) {
        return currentTime < sunrise || currentTime >= sunset;
    }

    async function getWeather(city) {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=es`;

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            const lat = data.coord.lat;
            const lon = data.coord.lon;

            let div = document.getElementById("weatherInfo");
            let btnVolver = document.getElementById("btnVolver");

            div.style.opacity = "1";
            div.style.transition = "1s ease-in-out";
            btnVolver.style.display = "block";
            div.style.overflowY = "auto"; // Agregar scroll
            div.style.padding = "10px";
            div.style.border = "1px solid #ccc";
            div.style.borderRadius = "5px";

            weatherInfo.innerHTML = `
                <h2>${data.name}, ${data.sys.country}</h2>
                <p>Temperatura: ${data.main.temp}°C</p>
                <p>Clima: ${data.weather[0].description} ${getWeatherEmoji(data.weather[0].description)}</p>
                <p>Humedad: ${data.main.humidity}%</p>
                <p>Viento: ${data.wind.speed} m/s</p>
                <h3>Pronóstico para las próximas horas:</h3>
                <div id="hourlyForecast">Cargando...</div>
            `;

            getHourlyForecast(city);
        } catch (error) {
            weatherInfo.innerHTML = `<p>Error al obtener los datos. Verifica la ciudad ingresada.</p>`;
            console.error(error);
        }
    }

    async function getHourlyForecast(city) {
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=es`;
    
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Error obteniendo el pronóstico por horas");
    
            const data = await response.json();
            const hourlyForecastDiv = document.getElementById("hourlyForecast");
    
            // Obtener la zona horaria en segundos proporcionada por OpenWeather
            const timezoneOffset = data.city.timezone; // Este valor está en segundos
    
            // Amanecer y atardecer en UTC
            const sunriseUTC = data.city.sunrise * 1000; // Convertir de segundos a milisegundos
            const sunsetUTC = data.city.sunset * 1000;   // Convertir de segundos a milisegundos
    
            // Convertir amanecer y atardecer a la hora local
            const localSunrise = new Date(sunriseUTC + timezoneOffset * 1000);
            const localSunset = new Date(sunsetUTC + timezoneOffset * 1000);
    
            // Obtener la hora actual en UTC y ajustarla a la zona horaria de la ciudad
            const nowUTC = new Date().getTime(); // Hora actual en UTC en milisegundos
            const localTime = new Date(nowUTC + timezoneOffset * 1000);
    
            // Mostrar valores en la consola para verificar
            console.log({
                ciudad: city,
                horaLocal: localTime.toLocaleTimeString("es-ES"),
                amanecerLocal: localSunrise.toLocaleTimeString("es-ES"),
                atardecerLocal: localSunset.toLocaleTimeString("es-ES"),
            });
    
            let forecastHTML = "<ul>";
    
            data.list.slice(0, 20).forEach((hour) => {
                const timestamp = hour.dt * 1000;
                const date = new Date(timestamp);
                const time = date.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                });
    
                const description = hour.weather[0].description;
                const isDay = !(timestamp < localSunrise.getTime() || timestamp >= localSunset.getTime()); // Comprobamos si es de día o de noche
    
                let emoji;
                if (isDay) {
                    emoji = getWeatherEmoji(description); // Usamos los emojis de clima normal
                } else {
                    const moonPhase = getMoonPhase(date); // Calculamos la fase lunar
                    emoji = getMoonEmoji(moonPhase); // Obtenemos el emoji de la fase lunar
                }
    
                forecastHTML += `
                    <li>${time}: ${hour.main.temp}°C, ${description} ${emoji}</li>
                `;
            });
    
            forecastHTML += "</ul>";
            hourlyForecastDiv.innerHTML = forecastHTML;
        } catch (error) {
            console.error("Error obteniendo el pronóstico por horas:", error);
            document.getElementById("hourlyForecast").innerHTML =
                "<p>No se pudo cargar el pronóstico por horas.</p>";
        }
    }    
    
});

if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("Service Worker registrado correctamente"))
        .catch((err) => console.log("Error al registrar Service Worker", err));
}

document.addEventListener("DOMContentLoaded", function () {
    const videoBackground = document.getElementById("video-background");

    function resetVideoSpeed() {
        videoBackground.playbackRate = 1; // Restablece la velocidad normal
    }

    function applySlowMotion() {
        setTimeout(() => {
            videoBackground.playbackRate = 0.3; // Velocidad lenta después de X segundos
        }, 3000);
    }

    function updateBackgroundVideo() {
        const now = new Date();
        const hours = now.getHours();

        if (hours >= 19 || hours < 6) {
            videoBackground.src = "BackgroundsVideos/LunaLlena.mp4";
        } else {
            videoBackground.src = "BackgroundsVideos/VideoPocoNublado.mp4";
        }

        videoBackground.load(); // Recarga el video
        videoBackground.play().then(() => {
            resetVideoSpeed(); // Asegurar que empiece en velocidad normal
            applySlowMotion(); // Aplicar velocidad lenta después de un tiempo
        });
    }

    videoBackground.addEventListener("play", resetVideoSpeed); // Siempre reinicia la velocidad normal al empezar
    videoBackground.addEventListener("ended", function () {
        resetVideoSpeed(); // Resetear velocidad antes de reiniciar
        videoBackground.currentTime = 0; // Asegurar que el video empiece desde el inicio
        videoBackground.play(); // Reproducir de nuevo
        applySlowMotion(); // Volver a aplicar el efecto
    });

    updateBackgroundVideo();
});
