const soundA = document.querySelector('#sound-a');
const soundS = document.querySelector('#sound-s');
const soundD = document.querySelector('#sound-d');
const soundF = document.querySelector('#sound-f');

const playbtn = document.querySelector('#play');
const stopbtn = document.querySelector('#stop');
const record = [
	document.querySelector('#record1'),
	document.querySelector('#record2'),
	document.querySelector('#record3'),
	document.querySelector('#record4'),
];

let recordStart = undefined;
let channels = new Array(4);
let currentlyPlaying = [];
let currentChannel = undefined;

playbtn.addEventListener('click', () => {
	console.log(channels);
	for (let channel of channels) if (channel) playChannel(channel);
});

stopbtn.addEventListener('click', () => {
	currentChannel = recordStart = undefined;
	for (let entity of currentlyPlaying) window.clearInterval(entity);
	for (let i = 0; i < 4; i++) {
		record[i].style.transform = '';
		record[i].style.color = 'black';
	}
});

for (let i = 0; i < 4; i++) record[i].addEventListener('click', () => recordChannel(i));

document.addEventListener('keydown', (e) => {
	switch (e.key.toLowerCase()) {
		case 'a':
			playSound(soundA);
			break;
		case 's':
			playSound(soundS);
			break;
		case 'd':
			playSound(soundD);
			break;
		case 'f':
			playSound(soundF);
			break;
	}
});

function recordChannel(num) {
	if (!recordStart) {
		recordStart = Date.now();
		channels[num] = [];
		currentChannel = num;
		record[num].style.color = 'lightgray';
	} else if (currentChannel == num) {
		record[num].style.color = 'black';
		currentChannel = recordStart = undefined;
	}
}

function playChannel(channel) {
	console.log(channel);
	for (let entity of channel) {
		console.log(entity);
		currentlyPlaying.push(setTimeout(() => playSound(entity.el, false), entity.timestamp));
	}
}

function playSound(el, add = true) {
	animate(document.querySelector('#' + el.getAttribute('data-element')));
	el.currentTime = 0;
	el.play();
	if (add && currentChannel !== undefined) channels[currentChannel].push({ el, timestamp: Date.now() - recordStart });
}

function animate(el) {
	el.style.fontSize = '80px';
	setTimeout(() => (el.style.fontSize = '60px'), 100);
}
