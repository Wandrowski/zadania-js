const localStorageNotesKey = 'notesapp';
const main = document.querySelector('main');
const name = document.querySelector('#name');
const contents = document.querySelector('#contents');
const priority = document.querySelector('#priority');

// pobierz notatki z localStorage
let notes = JSON.parse(localStorage.getItem(localStorageNotesKey)) || [];
updateNotes();

document.querySelector('#noteAdd').addEventListener('click', onNewNote);
function onNewNote() {
	console.log('click', notes);
	if (name.value.length > 0) {
		const date = new Date().toLocaleString();
		notes.push({
			name: name.value,
			contents: contents.value,
			priority: priority.value,
			pinned: false,
			hash: btoa(date),
			date,
		});
		name.value = contents.value = '';
		updateNotes();
	}
}
function updateNotes() {
	main.innerHTML = '';
	notes = notes.sort((a, b) => {
		if (a.pinned < b.pinned) return 1;
		if (a.pinned > b.pinned) return -1;
		return 0;
	});
	console.info('Updated info', notes);
	for (let note of notes) {
		main.innerHTML += createNoteHtml(note);
	}
	saveNotes();
}
function pinClick(e) {
	for (let note of notes) {
		if (note.hash == e.getAttribute('data-id')) {
			note.pinned = !note.pinned;
			updateNotes();
			break;
		}
	}
}
function removeClick(e) {
	notes = notes.filter((a) => a.hash != e.getAttribute('data-id'));
	updateNotes();
}
function createNoteHtml(note) {
	return `
    <div class="note ${note.priority.toLowerCase()}">
        <div class="info">
          <h2>${note.name}</h2>
		  <div class="data">
		 	${note.contents} 
		  </div>
		</div>
		<div class="right">
			<button data-id="${btoa(note.date)}" onclick="javascript:removeClick(this)" class="pin">Remove</button>
			<button data-id="${btoa(note.date)}" onclick="javascript:pinClick(this)" class="pin">${
		note.pinned ? 'Unpin' : 'Pin'
	}</button>
		<span>${note.date.replace(', ', '\n')}</span>
		</div>
	</div>
    `;
}
function saveNotes() {
	localStorage.setItem(localStorageNotesKey, JSON.stringify(notes));
}
