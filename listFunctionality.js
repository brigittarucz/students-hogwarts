'use strict';

// Program start

let baseLink = 'https://petlatkea.dk/2019/hogwartsdata/students.json';
let nameLink = 'https://petlatkea.dk/2019/hogwartsdata/families.json';

// Side buttons functionality

let buttonFirstName = document.querySelector('.button-first-name');
buttonFirstName.addEventListener('click', sortFirstName);
let buttonLastName = document.querySelector('.button-last-name');
buttonLastName.addEventListener('click', sortLastName);

let buttonCurrent = document.querySelector('.students-number-current');
buttonCurrent.addEventListener('click', showCurrent);
let buttonExpell = document.querySelector('.students-number-expell');
buttonExpell.addEventListener('click', showExpelled);

function showExpelled() {
	document.querySelectorAll('.student-row').forEach((element) => element.remove());
	expelledStudents.forEach(displayStudent);
}

function showCurrent() {
	document.querySelectorAll('.student-row').forEach((element) => element.remove());
	currentStudents.forEach(displayStudent);
}

document.querySelector('tbody').addEventListener('click', expellStudent);

// Prepare needed empty data types

let housesArray = ['Gryffindor', 'Hufflepuff', 'Ravenclaw', 'Slytherin'];

let allStudents = [];
let currentStudents = [];
let expelledStudents = [];

let pureBloods = [];
let halfBloods = [];
let muggleBorns = [];

const Student = {
	firstName: '-firstName-',
	middleName: '-',
	lastName: '-',
	imageName: '-imageName-',
	houseName: '-houseName-',
	gender: '-gender-',
	id: '-',
	prefect: 0,
	expelled: 0,
	member: 0,
	blood: 'Muggle Born'
};

const Statistics = {
	numberStudents: 0,
	numberExpelled: 0,
	houseGryffindor: 0,
	houseHufflepuff: 0,
	houseRavenclaw: 0,
	houseSlytherin: 0
};

const Colors = {
	colorGryffindor: '#CE2045',
	colorRavenclaw: '#005B8A',
	colorSlytherin: '#0C5C4F',
	colorHufflepuff: '#EBAD1D'
};

const Prefect = {
	prefectGryffindor: 0,
	prefectRavenclaw: 0,
	prefectSlytherin: 0,
	prefectHufflepuff: 0,
	prefects: []
};

const studStatistics = Object.create(Statistics);
const houseColors = Object.create(Colors);
const studPrefects = Object.create(Prefect);

// Start program

window.addEventListener('DOMContentLoaded', initialize);

function initialize() {
	loadJSON();
}

// Fetch data functions

function loadJSON() {
	fetch(baseLink).then((e) => e.json()).then((dataObjects) => {
		generateObjects(dataObjects);
	});
	fetch(nameLink).then((e) => e.json()).then((dataBlood) => {
		generateBloodStatus(dataBlood);
	});
}

function generateBloodStatus(data) {
	// Create arrays of pure bloods and half bloods
	data.half.forEach((element) => halfBloods.push(element.toLowerCase()));
	data.pure.forEach((element) => pureBloods.push(element.toLowerCase()));

	// Call function
	cleanPureBloods();
}

function cleanPureBloods() {
	// Delete the half bloods from the pure bloods array
	for (let i = 0; i <= pureBloods.length; i++) {
		for (let j = 0; j <= halfBloods.length; j++) {
			if (pureBloods[i] == halfBloods[j]) {
				pureBloods.splice(i, 1);
			}
		}
	}

	// Update on each object from the lists their blood status
	insertListStatus(allStudents);
	insertListStatus(currentStudents);

	// Reload the list with the blood status applied
	currentStudents.forEach(displayStudent);

	// Re-add the event listener on click for prefect
	addEventPrefect();

	// Re-add the event listener on click for modal
	addEventModal();

	// Re-add the event listener on click for membership
	addEventMembership();
}

function insertListStatus(list) {
	list.forEach((element) => {
		for (let i = 0; i <= pureBloods.length; i++) {
			if (pureBloods[i] == element.lastName) {
				element.blood = 'Pure Blood';
				element.member = 'can-be';
			}
		}
		for (let j = 0; j <= halfBloods.length; j++) {
			if (halfBloods[j] == element.lastName) {
				element.blood = 'Half Blood';
			}
		}
	});
}

// Take the raw data and generate organized objects with it

function generateObjects(data) {
	data.forEach((jsonObject) => {
		// Created an empty student obj with the prototype
		const newStudent = Object.create(Student);

		// Prepare name format
		let fullName = jsonObject.fullname;
		fullName = fullName.trim();
		fullName = fullName.toLowerCase();
		fullName = fullName.replace(/[^\w]/g, ' ');

		// Append to object the prepared name format
		newStudent.firstName = fullName.split(' ')[0];
		if (fullName.split(' ').length == 2) {
			newStudent.lastName = fullName.split(' ')[1];
		}
		if (fullName.split(' ').length == 3) {
			newStudent.lastName = fullName.split(' ')[2];
			newStudent.middleName = fullName.split(' ')[1];
		}

		// Add image name
		newStudent.imageName = newStudent.lastName + '_' + newStudent.firstName.charAt(0);

		// Prepare house format
		let house = jsonObject.house;
		house = house.trim();
		house = house.toLowerCase();
		house = house.charAt(0).toUpperCase() + house.substring(1, house.length);

		newStudent.houseName = house;
		newStudent.gender = jsonObject.gender;
		newStudent.id = uuidv4();
		newStudent.prefect = 0;
		newStudent.expelled = 0;
		newStudent.member = 0;
		newStudent.blood = 'Muggle Born';

		if (newStudent.houseName == 'Slytherin') {
			newStudent.member = 'can-be';
		}

		generatePrefects(house, newStudent);
		generateStatistics(house);

		allStudents.push(newStudent);
	});

	// Injecting myself into the list

	const brigittaStudent = Object.create(Student);
	creatingMyself(brigittaStudent);
	allStudents.push(brigittaStudent);

	for (let i = 0; i < allStudents.length; i++) {
		currentStudents.push(allStudents[i]);
	}
}

function creatingMyself(brigittaStudent) {
	brigittaStudent.firstName = 'Brigitta';
	brigittaStudent.middleName = 'Roberta';
	brigittaStudent.lastName = 'Rucz';
	brigittaStudent.imageName = 'rucz_b';
	brigittaStudent.houseName = 'Gryffindor';
	brigittaStudent.gender = 'girl';
	brigittaStudent.id = uuidv4();
	brigittaStudent.prefect = 0;
	brigittaStudent.expelled = 'never';
	brigittaStudent.member = 0;
	brigittaStudent.blood = 'O1';
}

function addEventMembership() {
	// Select button and add event listener
	document
		.querySelectorAll('[data-action=make-member]')
		.forEach((element) => element.addEventListener('click', checkMember));
}

function checkMember() {
	let clickedElement = event.target;
	// Execute makeMember function if student is not a member
	if (clickedElement.dataset.status == 'not-member') {
		makeMember(clickedElement);
		// Execute removeMember function if student is a member
	} else if (clickedElement.dataset.status == 'member') {
		removeMember(clickedElement);
	}
}

function makeMember(clickedElement) {
	// Update specific student object membership status in each list
	setObjectList(clickedElement, currentStudents, true);
	setObjectList(clickedElement, allStudents, true);

	clickedElement.textContent = 'Redeem Status';
	clickedElement.dataset.status = 'member';
}

function removeMember(clickedElement) {
	// Update specific student object membership status in each list
	setObjectList(clickedElement, currentStudents, false);
	setObjectList(clickedElement, allStudents, false);

	clickedElement.textContent = 'Make Member';
	clickedElement.dataset.status = 'not-member';
}

// Update lists function

function setObjectList(clickedElement, list, booleanVal) {
	// Find index of returned element in list
	let index = list.findIndex((element) => {
		// If the first name of the clicked element is equal to the first name in the list return element
		if (
			element.firstName ==
			clickedElement.parentElement.parentElement.querySelector('[data-field=first-name]').textContent
		) {
			return element;
		}
	});

	// Set the index of the clicked element in the list to 0 or 1
	list[index].member = booleanVal;
}

function addEventPrefect() {
	document
		.querySelectorAll('[data-action=make-prefect]')
		.forEach((element) => element.addEventListener('click', checkPrefect));
}

function checkPrefect() {
	let house = event.target.parentElement.parentElement.querySelector('[data-field=house-name]').textContent;
	let clickedElement = event.target;

	if (event.target.dataset.status == 'prefect') {
		removePrefect(clickedElement, house);
	} else if (event.target.dataset.status == 'not-prefect') {
		addPrefect(clickedElement, house);
	}
}

function addPrefect(clickedElement, house) {
	if (studPrefects['prefect' + house] == 2) {
		let existentPrefects = [];
		studPrefects.prefects.forEach((element) => {
			if (element.houseName == house) {
				existentPrefects.push(
					element.firstName.charAt(0).toUpperCase() + element.firstName.substring(1, element.firstName.length)
				);
			}
		});
		alert(`We are sorry to inform you that ${existentPrefects[0]} and
        ${existentPrefects[1]} are already prefects of house ${house}. Remove 
        one of them in order to establish a new one!`);
	} else {
		studPrefects['prefect' + house] += 1;

		let indexListCurrent = currentStudents.findIndex((element) => {
			if (
				element.firstName ==
				clickedElement.parentElement.parentElement.querySelector('[data-field=first-name]').textContent
			) {
				return element;
			}
		});

		currentStudents[indexListCurrent].prefect == 1;
		studPrefects.prefects.push(currentStudents[indexListCurrent]);

		clickedElement.dataset.status = 'prefect';
		clickedElement.textContent = 'Redeem status';
		clickedElement.parentElement.parentElement.querySelector('[data-field=image-name] img').style.filter =
			'grayscale(0) sepia(100)';
	}
}

function removePrefect(clickedElement, house) {
	studPrefects['prefect' + house] -= 1;

	let indexListPrefects = studPrefects['prefects'].findIndex((element) => {
		if (
			element.firstName ==
			clickedElement.parentElement.parentElement.querySelector('[data-field=first-name]').textContent
		) {
			return element;
		}
	});

	studPrefects.prefects.splice(indexListPrefects, 1);

	clickedElement.dataset.status = 'not-prefect';
	clickedElement.textContent = 'Make prefect';
	clickedElement.parentElement.parentElement.querySelector('[data-field=image-name] img').style.filter =
		'grayscale(100) sepia(0)';
}

function generatePrefects(house, newStudent) {
	if (studPrefects['prefect' + house] < 2) {
		studPrefects['prefect' + house] += 1;
		newStudent.prefect = 1;
		studPrefects.prefects.push(newStudent);
	}
}

// Generate statistics

function generateStatistics(house) {
	studStatistics['numberExpelled'] = 0;
	studStatistics['numberStudents'] += 1;
	studStatistics['house' + house] += 1;
}

// Prepare for cloning

function displayStudent(student, index) {
	const clone = document.querySelector('template#student-template').content.cloneNode(true);
	const parent = document.querySelector('tbody');

	clone.querySelector('[data-field=image-name] img').src = 'students/' + student.imageName + '.png';
	clone.querySelector('[data-field=first-name]').textContent = student.firstName;
	clone.querySelector('[data-field=middle-name]').textContent = student.middleName;
	clone.querySelector('[data-field=last-name]').textContent = student.lastName;
	clone.querySelector('[data-field=house-name]').textContent = student.houseName;
	clone.querySelector('[data-field=gender]').textContent = student.gender;
	clone.querySelector('[data-action=remove]').dataset.id = student.id;
	clone.querySelector('[data-action=remove]').dataset.index = index;

	if (student.member == 0) {
		clone.querySelector('.button-membership').textContent = 'Cannot Be A Member';
	}

	if (student.prefect == 1) {
		clone.querySelector('[data-action=make-prefect]').dataset.status = 'prefect';
		clone.querySelector('[data-action=make-prefect]').textContent = 'Reedem status';
		clone.querySelector('[data-field=image-name] img').style.filter = 'grayscale(0) sepia(60%)';
	}

	if (student.firstName == 'Brigitta') {
		clone.querySelector('[data-action=remove]').dataset.action = 'unremovable';
	}
	parent.appendChild(clone);
}

// Update statistics

function updateStatistics() {
	document.querySelector('.students-number').textContent = studStatistics.numberStudents;
	document.querySelector('.students-number-expelled').textContent = studStatistics.numberExpelled;
	housesArray.forEach((house) => {
		document.querySelector('.students-number-' + house).textContent = '(' + studStatistics['house' + house] + ')';
	});
}

// Sorting by first name

function sortFirstName() {
	// Get node list of first-names
	let elements = document.querySelectorAll('[data-field=first-name]');
	// Transform node list into an array
	elements = Array.prototype.slice.call(elements);
	// Sort array
	elements.sort((firstFirstName, secondFirstName) =>
		firstFirstName.textContent.localeCompare(secondFirstName.textContent)
	);
	// Insert array
	elements.forEach((sortedElement) => document.querySelector('tbody').appendChild(sortedElement.parentElement));
}

// Sorting by last name

function sortLastName() {
	// Get node list of first-names
	let elements = document.querySelectorAll('[data-field=last-name]');
	// Transform node list into an array
	elements = Array.prototype.slice.call(elements);
	// Sort array
	elements.sort((firstLastName, secondLastName) =>
		firstLastName.textContent.localeCompare(secondLastName.textContent)
	);
	// Insert array
	elements.forEach((sortedElement) => document.querySelector('tbody').appendChild(sortedElement.parentElement));
}

// Filtering by house

housesArray.forEach((house) => {
	document.querySelector(`.${house}-checkbox`).addEventListener('click', filterByHouse);
});

function filterByHouse() {
	// Check if element's checkbox is checked using a boolean
	if (event.target.checked == false) {
		// If no, select all elements with the specific house name that was clicked
		document.querySelectorAll('[data-field=house-name]').forEach((tdHouse) => {
			if (tdHouse.textContent == event.target.value) {
				// Hide them all
				tdHouse.parentElement.style.display = 'none';
			}
		});
	} else {
		// If yes, select all elements with the specific house name that was clicked
		document.querySelectorAll('[data-field=house-name]').forEach((tdHouse) => {
			if (tdHouse.textContent == event.target.value) {
				// Show them all
				tdHouse.parentElement.style.display = 'table-row';
			}
		});
	}
}

// Expelling a student
// https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript

function uuidv4() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = (Math.random() * 16) | 0,
			v = c == 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

function expellStudent() {
	// Do if the button has a "remove" action attached to it
	if (event.target.dataset.action == 'remove') {
		alert('Note that expelling a student makes them loose their status( in case they have one )!');
		let expelledStudent = event.target;

		updateListsOnExpell(expelledStudent);

		// Find house of expelled student
		let house = expelledStudent.parentElement.parentElement.querySelector('[data-field=house-name]').textContent;

		// Delete all students
		document.querySelectorAll('.student-row').forEach((element) => element.remove());

		// Populate again with the remaining number of students
		currentStudents.forEach(displayStudent);

		// Modify statistics of the house in case of expell
		modifyStatistics(house);

		// Re-add the event listener on click for modal
		addEventModal();

		// Re-add the event listener on click for prefect
		addEventPrefect();

		// Re-add the event listener on click for membership
		addEventMembership();

		// Remove the expelled student's prefect status
		removePrefect(expelledStudent, house);
	} else if (event.target.dataset.action == 'unremovable') {
		// Do if the button has an "unremovable" action attached to it
		startHack();
	}
}

function updateListsOnExpell(expelledStudent) {
	let index;
	let studId = expelledStudent.dataset.id;

	// Index for current students -> current list
	currentStudents.forEach((element) => {
		if (studId == element['id']) {
			index = currentStudents.indexOf(element);
		}
	});
	currentStudents[index].expelled = 1;
	currentStudents[index].prefect = 0;
	let expelledStud = currentStudents.splice(index, 1);
	expelledStudents.push(expelledStud[0]);

	// Index for all students -> all students list
	allStudents.forEach((element) => {
		if (studId == element['id']) {
			index = allStudents.indexOf(element);
		}
	});

	allStudents[index].expelled = 1;
	allStudents[index].prefect = 0;
	allStudents[index].member = 0;
}

function modifyStatistics(house) {
	studStatistics['house' + house] -= 1;
	studStatistics['numberExpelled'] += 1;
	studStatistics['numberStudents'] -= 1;
	updateStatistics();
}

// Modal functionality

function addEventModal() {
	document
		.querySelectorAll('td:not(.button)')
		.forEach((studentRow) => studentRow.addEventListener('click', generateModal));
}

function generateModal() {
	let modal = document.querySelector('#modal-element');
	let indexStudent;
	let studId = event.target.parentElement.querySelector('[data-action=remove]').dataset.id;

	allStudents.forEach((element) => {
		if (studId == element['id']) {
			indexStudent = allStudents.indexOf(element);
		}
	});

	modal.querySelector('.modal-content').style.backgroundImage = `radial-gradient(circle, ${houseColors[
		'color' + allStudents[indexStudent].houseName
	]} 0%, rgba(0, 0, 0, 1) 48%)`;
	modal.querySelector('.modal-crest').src = 'graphics/' + allStudents[indexStudent].houseName + '.jpg';
	modal.querySelector('.stud-img-modal').src = 'students/' + allStudents[indexStudent].imageName + '.png';
	let studName =
		allStudents[indexStudent].firstName +
		' ' +
		allStudents[indexStudent].middleName +
		' ' +
		allStudents[indexStudent].lastName;
	studName = studName.replace(/[^\w]/g, ' ');
	modal.querySelector('.full-name').textContent = studName;
	modal.querySelector('.modal-house').textContent = allStudents[indexStudent].houseName;
	modal.querySelector('.modal-blood').textContent = allStudents[indexStudent].blood;

	if (allStudents[indexStudent].prefect == 0) {
		modal.querySelector('.modal-status').textContent = 'Not a Prefect';
	} else {
		modal.querySelector('.modal-status').textContent = 'Prefect';
	}

	if (allStudents[indexStudent].expelled == 0) {
		modal.querySelector('.modal-expelled').textContent = 'Not Expelled';
	} else if (allStudents[indexStudent].expelled == 1) {
		modal.querySelector('.modal-expelled').textContent = 'Expelled';
	} else {
		modal.querySelector('.modal-expelled').textContent = 'Incognito';
	}

	if (allStudents[indexStudent].member == 1) {
		modal.querySelector('.modal-member').textContent = 'Member of the Inquisitorial Squad';
	}

	showModal();
}

function showModal() {
	let modal = document.querySelector('#modal-element');
	modal.style.display = 'block';
	modal.querySelector('.close').addEventListener('click', () => (modal.style.display = 'none'));
}

function startHack() {
	playMusic();
	generateHeaders();
	changeColors();
}

function playMusic() {
	let audioShutdown = document.querySelector('.audioShutdown');
	audioShutdown.play();
	let audioDarude = document.querySelector('.audioDarude');
	audioDarude.play();
	audioShutdown.onended = function () {
		let counter = 0;
		let audioError = document.querySelector('.audioError');
		let interval = setInterval(() => {
			counter += 1;
			if (counter === 40) {
				clearInterval(interval);
			} else {
				audioError.play();
			}
		}, 50);
	};
}

function generateHeaders() {
	let parentContainer = document.querySelector('.container-headers');
	let header = document.querySelector('.do-not-delete');

	let counter = 0;

	let interval = setInterval(() => {
		counter += 1;
		if (counter === 35) {
			clearInterval(interval);
			parentContainer.querySelectorAll('.do-not-delete').forEach((element) => element.remove());
			header.style.display = 'none';
			openWindows();
		} else {
			let clone = header.cloneNode(true);
			clone.style.marginLeft = Math.floor(Math.random() * 700 + 150) + 'px';
			clone.style.marginTop = Math.floor(Math.random() * 600 + 150) + 'px';
			clone.style.fontSize = Math.floor(Math.random() * 84 + 24) + 'px';
			header.style.display = 'block';
			parentContainer.appendChild(clone);
		}
	}, 150);
}

function changeColors() {
	let body = document.querySelector('body');

	let counter = 0;
	let interval = setInterval(() => {
		counter += 1;
		if (counter === 20) {
			clearInterval(interval);
		} else {
			if (counter % 2 == 0) {
				body.style.filter = 'invert(100%)';
			} else {
				body.style.filter = 'invert(0%)';
			}
		}
	}, 200);
}

function openWindows() {
	window.open(
		'https://www.google.com/search?q=how+to+delete+system+32&oq=how+to+delete+system+32&aqs=chrome..69i57j0l5.3694j0j4&sourceid=chrome&ie=UTF-8',
		'_blank'
	);
	window.open('https://www.youtube.com/watch?v=g4mHPeMGTJM', '_blank');
	window.open(
		'https://www.google.com/search?q=why+doesn%27t+glue+stick+to+the+inside+of+the+bottle&oq=why+doesnt+glue+st&aqs=chrome.1.69i57j0l2.4775j0j1&sourceid=chrome&ie=UTF-8',
		'_blank'
	);
}