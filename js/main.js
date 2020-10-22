const weatherAPI = new WeatherAPI();
const weatherHere = document.querySelector('.main_city');
const weatherCity = document.querySelector('.other_cities');
if (!localStorage.getItem('favoritesList')) {
    localStorage.setItem('favoritesList', '[]');
}

window.onoffline = (e) => errorProcessing('Internet connection lost. Try again.');

updateWeatherHere();
updateWeatherFavorites();

const updateButton = document.querySelectorAll('.update_button_text');
for(let i = 0; i < updateButton.length; i++){
    if (updateButton){
        updateButton[i].addEventListener('click', updateWeatherHere)
    }
}
const updateButtonSmall = document.querySelectorAll('.update_button_sign');
for(let i = 0; i < updateButtonSmall.length; i++){
    if (updateButtonSmall){
        updateButtonSmall[i].addEventListener('click', updateWeatherHere)
    }
}

const addCityButton = document.querySelectorAll('.add_new_city');
for(let i = 0; i < addCityButton.length; i++){
    if (addCityButton){
        addCityButton[i].addEventListener('submit', addToFavorites);
    }
}

