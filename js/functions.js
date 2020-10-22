const replaceSpacesAndEtc = (cityName) => {
    return cityName.replace(/\s/g,"_");
};

const weatherHereWaiting = () => {
    const weatherHereWaitingTemplate = document.querySelector('#main_city_waiting');
    return document.importNode(weatherHereWaitingTemplate.content, true);
};

const weatherCityWaiting = (cityName) => {
    const weatherCityWaitingTemplate = document.querySelector('#city_waiting');
    const newWeatherCityWaiting = document.importNode(weatherCityWaitingTemplate.content, true);
    newWeatherCityWaiting.querySelector('.city_name').innerText = cityName;
    newWeatherCityWaiting.firstElementChild.setAttribute('cityName', replaceSpacesAndEtc(cityName));
    return newWeatherCityWaiting;
};

const weatherHereFunc = (weather) => {
    const weatherHereTemplate = document.querySelector('#main_city_now');
    const newWeatherHere = document.importNode(weatherHereTemplate.content, true);
    setWeatherParameters(newWeatherHere, weather);
    return newWeatherHere;
};

const weatherCityFunc = (weather) => {
    const weatherCityTemplate = document.querySelector('#city');
    const newWeatherCity = document.importNode(weatherCityTemplate.content, true);
    setWeatherParameters(newWeatherCity, weather);
    newWeatherCity.querySelector('.delete-button').addEventListener('click', removeFromFavorites);
    newWeatherCity.firstElementChild.setAttribute('cityName', replaceSpacesAndEtc(weather.name));
    return newWeatherCity;
};

async function updateWeatherHere() {
    weatherHere.innerHTML = "";
    const waitingCity = weatherHereWaiting();
    weatherHere.append(waitingCity);
    navigator.geolocation.getCurrentPosition(coordinates => {
        weatherAPI.getByCityCoordinates(coordinates)
            .then(weather => {
                weatherHere.innerHTML = "";
                weatherHere.append(weatherHereFunc(weather));
            }).catch(() => errorProcessing('Something went wrong. Try again.'))
    }, () => weatherAPI.getByCityName("Saint%20Petersburg").then(weather => {
        weatherHere.innerHTML = "";
        weatherHere.append(weatherHereFunc(weather));
    }).catch(() => errorProcessing('Something went wrong. Try again.')))
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
    return element;
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
    updateWeatherFavorites();
};

const addToFavorites = async evt => {
    evt.preventDefault();
    const searchInput = document.getElementById('add_new_city');
    const cityName = searchInput.value.trim();
    searchInput.value = '';
    let exist = false;
    const list = JSON.parse(localStorage.getItem('favoritesList'));

    for (let i = 0; i < list.length; i++) {
        if (list[i].toLowerCase() === cityName.toLowerCase()) {
            exist = true;
            break;
        }
    }
    if (!exist) {
        let response;
        try {
            response = await weatherAPI.getByCityName(cityName);
        } catch (e) {
            errorProcessing('Something went wrong. Try again.')
        }
        console.log(response);
        if (response.cod === 200) {
            const favoritesList = JSON.parse(localStorage.getItem('favoritesList'));
            let coordinates = {coords: {latitude: response.coord.lat, longitude: response.coord.lon}};
            const responseWithName = await weatherAPI.getByCityCoordinates(coordinates);
            if (!(favoritesList.includes(responseWithName.name))) {
                localStorage.setItem('favoritesList', JSON.stringify([responseWithName.name, ...favoritesList]));
                updateWeatherFavorites();
            } else {
                errorProcessing('This city is already in list');
            }
        } else {
            errorProcessing('City not found')
        }
    } else {
        errorProcessing('This city is already in list');
    }
};

const updateWeatherFavorites = () => {
    const favoritesList = JSON.parse(localStorage.getItem('favoritesList'));
    let citiesToAdd = [], citiesElementToRemove = [];
    for (let city of favoritesList) {
        const cityName = city.toString();
        if (!weatherCity.querySelector(`.weather_city[cityName=${replaceSpacesAndEtc(cityName)}]`)) {
            citiesToAdd.push(cityName);
        }
    }
    for (const cityElement of weatherCity.children) {
        const thisCityName = cityElement.querySelector('.city_name').innerText;
        if (!(favoritesList.includes(thisCityName))) {
            citiesElementToRemove.push(cityElement);
        }
    }
    citiesElementToRemove.forEach(cityElementToRemove => weatherCity.removeChild(cityElementToRemove));
    citiesToAdd.forEach(cityToAdd => {
        weatherCity.append(weatherCityWaiting(cityToAdd));
        const newCityElement = weatherCity.querySelector(`.weather_city[cityName=${replaceSpacesAndEtc(cityToAdd)}]`);
        weatherAPI.getByCityName(cityToAdd)
            .then(weather =>
                weatherCity.replaceChild(weatherCityFunc(weather), newCityElement))
            .catch(() => errorProcessing('Something went wrong. Try again.'));
    })
};

const errorProcessing = (errorMessage) => {
    let errorDiv = document.getElementById('error');
    errorDiv.innerHTML = errorMessage;
    setTimeout(() => {
        errorDiv.innerHTML = '';
    }, 2000);
};