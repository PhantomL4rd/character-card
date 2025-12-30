import type { CardData } from '$lib/types/card';

const initialCardData: CardData = {
	characterName: '',
	dataCenter: '',
	world: '',
	playStyle: {
		contents: [],
		attitude: null,
		jobs: []
	},
	loginTime: {
		days: [],
		times: []
	},
	image: {
		src: null,
		rotation: 0,
		offset: null,
		zoom: 1
	},
	design: {
		theme: 'dark',
		orientation: 'landscape',
		textPosition: {
			vertical: 'bottom',
			horizontal: 'left'
		}
	}
};

function createCardStore() {
	let cardData = $state<CardData>(structuredClone(initialCardData));

	return {
		get data() {
			return cardData;
		},
		get canExport() {
			return cardData.characterName.trim().length > 0;
		},
		updateCharacterName(name: string) {
			cardData.characterName = name;
		},
		updateDataCenter(dc: string) {
			cardData.dataCenter = dc;
			cardData.world = '';
		},
		updateWorld(world: string) {
			cardData.world = world;
		},
		updateImage(src: string) {
			cardData.image.src = src;
			cardData.image.rotation = 0;
			cardData.image.offset = { x: 0, y: 0 };
			cardData.image.zoom = 1;
		},
		updateRotation(rotation: 0 | 90 | 180 | 270) {
			cardData.image.rotation = rotation;
			cardData.image.offset = { x: 0, y: 0 };
			cardData.image.zoom = 1;
		},
		updateImageOffset(x: number, y: number, zoom: number) {
			cardData.image.offset = { x, y };
			cardData.image.zoom = zoom;
		},
		toggleContent(content: CardData['playStyle']['contents'][number]) {
			const idx = cardData.playStyle.contents.indexOf(content);
			if (idx === -1) {
				cardData.playStyle.contents.push(content);
			} else {
				cardData.playStyle.contents.splice(idx, 1);
			}
		},
		updateAttitude(attitude: CardData['playStyle']['attitude']) {
			cardData.playStyle.attitude = attitude;
		},
		toggleJob(jobId: string) {
			const idx = cardData.playStyle.jobs.indexOf(jobId);
			if (idx === -1) {
				cardData.playStyle.jobs.push(jobId);
			} else {
				cardData.playStyle.jobs.splice(idx, 1);
			}
		},
		toggleDay(day: CardData['loginTime']['days'][number]) {
			const idx = cardData.loginTime.days.indexOf(day);
			if (idx === -1) {
				cardData.loginTime.days.push(day);
			} else {
				cardData.loginTime.days.splice(idx, 1);
			}
		},
		toggleTime(time: CardData['loginTime']['times'][number]) {
			const idx = cardData.loginTime.times.indexOf(time);
			if (idx === -1) {
				cardData.loginTime.times.push(time);
			} else {
				cardData.loginTime.times.splice(idx, 1);
			}
		},
		updateTheme(theme: 'dark' | 'light') {
			cardData.design.theme = theme;
		},
		updateOrientation(orientation: 'landscape' | 'portrait') {
			cardData.design.orientation = orientation;
		},
		updateTextPosition(
			vertical: 'top' | 'center' | 'bottom',
			horizontal: 'left' | 'center' | 'right'
		) {
			cardData.design.textPosition.vertical = vertical;
			cardData.design.textPosition.horizontal = horizontal;
		},
		reset() {
			cardData = structuredClone(initialCardData);
		}
	};
}

export const cardStore = createCardStore();
