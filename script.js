const apiKey = "4144ec21e5ac6f1ab3e15a226349e098";

document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.getElementById("searchForm");
    const cityInput = document.getElementById("cityInput");
    const weatherInfo = document.getElementById("weatherInfo");

    searchForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Evita la recarga de la página
        const city = cityInput.value.trim(); // Limpia espacios en blanco
        if (city) {
            getWeather(city);
        }
    });

    async function getWeather(city) {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=es`;

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(
                    `Error: ${response.status} - ${response.statusText}`
                );
            }


            const data = await response.json();

            let div = document.getElementById("weatherInfo");
            let btnVolver = document.getElementById("btnVolver");

            div.style.display = "block"; // Muestra el div cada vez que se agrega algo
            btnVolver.style.display = "block";

            weatherInfo.innerHTML = `
                <h2>${data.name}, ${data.sys.country}</h2>
                <p>Temperatura: ${data.main.temp}°C</p>
                <p>Clima: ${data.weather[0].description}</p>
                <p>Humedad: ${data.main.humidity}%</p>
                <p>Viento: ${data.wind.speed} m/s</p>
            `;


        } catch (error) {
            weatherInfo.innerHTML = `<p>Error al obtener los datos. Verifica la ciudad ingresada.</p>`;
            console.error(error);
        }
    }
});

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js")
        .then(() => console.log("Service Worker registrado correctamente"))
        .catch(err => console.log("Error al registrar Service Worker", err));
}
