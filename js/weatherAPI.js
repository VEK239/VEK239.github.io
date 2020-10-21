class WeatherAPI {
    constructor() {
        this.apiKey = 'e267121629c6ced2571f28e2504bec69'
    }

    async getByCityName(cityName) {
        const response = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${this.apiKey}&units=metric`);
        return await response.json()
    }

    async getByCityCoordinates(coordinates) {
        const [lat, lon] = [coordinates.coords.latitude, coordinates.coords.longitude];
        const response = await fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`);
        return await response.json()
    }

    getIconURL(iconCode) {
        return `http://openweathermap.org/img/wn/${iconCode}.png`
    }
}


