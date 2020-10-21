const weatherHereWaiting = () => {
    const weatherHereWaitingTemplate = document.querySelector('#main_city_waiting');
    return document.importNode(weatherHereWaitingTemplate.content, true)
};

const weatherCityWaiting = (cityName) => {
    const weatherCityWaitingTemplate = document.querySelector('#city_waiting');
    const newWeatherCityWaiting = document.importNode(weatherCityWaitingTemplate.content, true);
    newWeatherCityWaiting.querySelector('.city_name').innerText = cityName;
    newWeatherCityWaiting.firstElementChild.setAttribute('cityName', cityName);
    return newWeatherCityWaiting
};

const weatherHereFunc = (weather) => {
    const weatherHereTemplate = document.querySelector('#main_city_now');
    const newWeatherHere = document.importNode(weatherHereTemplate.content, true);
    setWeatherParameters(newWeatherHere, weather);
    return newWeatherHere
};

const weatherCityFunc = (weather) => {
    const weatherCityTemplate = document.querySelector('#city');
    const newWeatherCity = document.importNode(weatherCityTemplate.content, true);
    setWeatherParameters(newWeatherCity, weather);
    newWeatherCity.querySelector('.delete-button').addEventListener('click', removeFromFavorites);
    newWeatherCity.firstElementChild.setAttribute('cityName', weather.name);
    return newWeatherCity
};

async function updateWeatherHere() {
    console.log('in update weather here');
    weatherHere.innerHTML = "";
    const waitingCity = weatherHereWaiting();
    weatherHere.append(waitingCity);
    navigator.geolocation.getCurrentPosition(coordinates => {
        weatherAPI.getByCityCoordinates(coordinates)
            .then(weather => {
                weatherHere.innerHTML = "";
                weatherHere.append(weatherHereFunc(weather))
            })
    }, await weatherAPI.getByCityName('Saint-Petersburg').then(weather => {
        weatherHere.innerHTML = "";
        weatherHere.append(weatherHereFunc(weather))
    }))
}

const setWeatherParameters = (element, weatherObject) => {
    const {name, icon, temperature, wind, cloud, pressure, humidity, coordinates} = getWeatherParameters(element);
    name.innerHTML = weatherObject.name;
    icon.src = weatherAPI.getIconURL(weatherObject.weather[0].icon);
    temperature.innerHTML = `${Math.round(weatherObject.main.temp)}°C`;
    wind.innerHTML = `${weatherObject.wind.speed} m/s`;
    cloud.innerHTML = `${weatherObject.clouds.all}%`;
    pressure.innerHTML = `${weatherObject.main.pressure} hpa`;
    humidity.innerHTML = `${weatherObject.main.humidity}%`;
    coordinates.innerHTML = `[${weatherObject.coord.lat.toFixed(2)}, ${weatherObject.coord.lon.toFixed(2)}]`;
    return element
};

const getWeatherParameters = weatherCity => {
    return {
        name: weatherCity.querySelector('.city_name'),
        icon: weatherCity.querySelector('.icon-weather'),
        temperature: weatherCity.querySelector('.degrees'),
        wind: weatherCity.querySelector('.wind_line .info'),
        cloud: weatherCity.querySelector('.cloudiness_line .info'),
        pressure: weatherCity.querySelector('.pressure_line .info'),
        humidity: weatherCity.querySelector('.humidity_line .info'),
        coordinates: weatherCity.querySelector('.coordinates_line .info')
    }
};

const removeFromFavorites = evt => {
    const thisCityName = evt.currentTarget.parentElement.firstElementChild.innerHTML;
    const favoritesList = JSON.parse(localStorage.getItem('favoritesList'));
    localStorage.setItem('favoritesList', JSON.stringify(favoritesList.filter(cityName => cityName !== thisCityName)));
    updateWeatherFavorites()
};

const addToFavorites = async evt => {
    console.log('in add to favorites');
    evt.preventDefault();
    const searchInput = document.getElementById('add_new_city');
    const cityName = searchInput.value.trim();
    const response = await weatherAPI.getByCityName(cityName);
    console.log(response);

    let exist = false;

    const list = JSON.parse(localStorage.getItem('favoritesList'));
    for (let i = 0; i < list.length; i++)
        if (list[i] === cityName) {
            exist = true;
            break;
        }
    if (!exist) {
        if (response.cod === 200) {
            const favoritesList = JSON.parse(localStorage.getItem('favoritesList'));
            localStorage.setItem('favoritesList', JSON.stringify([cityName, ...favoritesList]));
            updateWeatherFavorites()
        } else if (response.cod === 404) {
            alert(`${cityName} not found`);
            searchInput.value = ''
        }
    }
};

const updateWeatherFavorites = () => {
    const favoritesList = JSON.parse(localStorage.getItem('favoritesList'));
    console.log(favoritesList);
    let citiesToAdd = [], citiesElementToRemove = [];
    for (let city of favoritesList) {
        const cityName = city;
        if (!weatherCity.querySelector(`.weather_city[cityName=${cityName}]`)) {
            citiesToAdd.push(cityName)
        }
    }
    console.log(citiesToAdd);
    for (const cityElement of weatherCity.children) {
        const thisCityName = cityElement.querySelector('.city_name').innerText;
        if (!(favoritesList.includes(thisCityName)))
            citiesElementToRemove.push(cityElement)
    }
    citiesElementToRemove.forEach(cityElementToRemove => weatherCity.removeChild(cityElementToRemove));
    citiesToAdd.forEach(cityToAdd => {
        weatherCity.append(weatherCityWaiting(cityToAdd));
        const newCityElement = weatherCity.querySelector(`.weather_city[cityName=${cityToAdd}]`);
        console.log(newCityElement);
        weatherAPI.getByCityName(cityToAdd)
            .then(weather =>
                weatherCity.replaceChild(weatherCityFunc(weather), newCityElement))
            .catch(() => alert('Something went wrong... Please refresh the page'))
    })
};