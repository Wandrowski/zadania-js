const localStorageNotesKey = 'weathernoteapp';
const main = document.querySelector('main');
const locationInput = document.querySelector('#location');
const timer = document.querySelector('#timer');

// pobierz notatki z localStorage
let notes = JSON.parse(localStorage.getItem(localStorageNotesKey)) || [];
updateNotes();

// odswiez dane co 30 sekund
let currentTime = 0;
let timeToRefresh = 30;
setInterval(() => {
	if (++currentTime >= timeToRefresh) {
		updateNotes();
		currentTime = 0;
	}
	timer.textContent = timeToRefresh - currentTime + 's';
}, 1000);

document.querySelector('#noteAdd').addEventListener('click', onNewNote);
function onNewNote() {
	console.log('click', locationInput.value);
	if (locationInput.value.length > 0) {
		fetch(
			`https://api.openweathermap.org/data/2.5/weather?q=${locationInput.value}&units=metric&lang=PL&appid=0072ab5f1c96002a6aab9d24d6affa13`
		)
			.then((response) => response.json())
			.then((data) => {
				if (data.cod != '404') {
					// poprawna nazwa miejscowosci
					for (let note of notes) {
						if (note.location == data.name) {
							console.warn('Takie miasto jest już dodane!');
							return;
						}
					}
					let newNote = {
						location: data.name,
						temperature: data.main.temp,
						humidity: data.main.humidity,
						icon: data.weather[0].icon,
					};
					notes.push(newNote);
					updateNotes();
					locationInput.value = '';
				}
			});
	}
}
function updateNotes() {
	let newNotes = [];
	for (let note of notes) {
		fetch(
			`https://api.openweathermap.org/data/2.5/weather?q=${note.location}&units=metric&lang=PL&appid=0072ab5f1c96002a6aab9d24d6affa13`
		)
			.then((response) => response.json())
			.then((data) => {
				if (data.cod != '404') {
					// poprawna nazwa miejscowosci
					let newNote = {
						location: data.name,
						temperature: data.main.temp,
						humidity: data.main.humidity,
						icon: data.weather[0].icon,
					};
					newNotes.push(newNote);
					if (newNotes.length == notes.length) {
						main.innerHTML = '';
						// sortowanie po nazwie miasta
						notes = newNotes.sort((a, b) => {
							let temp1 = a.location.toLowerCase();
							let temp2 = b.location.toLowerCase();
							if (temp1 < temp2) return -1;
							if (temp1 > temp2) return 1;
							return 0;
						});
						console.info('Updated info', notes);
						for (let note of notes) {
							main.innerHTML += createNoteHtml(note);
						}
						saveNotes();
					}
				}
			});
	}
}
function createNoteHtml(note) {
	return `
        <div class="note">
        <div class="info">
          <h2>${note.location}</h2>
          <div class="data"><span>${note.temperature.toFixed(1)}°C</span> <span>${note.humidity}%</span></div>
        </div>
        <div>
          <img
            src="http://openweathermap.org/img/wn/${note.icon}@2x.png"
            alt="condition"
          />
        </div>
      </div>
    `;
}
function saveNotes() {
	localStorage.setItem(localStorageNotesKey, JSON.stringify(notes));
}
