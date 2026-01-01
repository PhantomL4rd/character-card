import { browser } from '$app/environment';
import type { CardData, CroppedArea } from '$lib/types/card';

const STORAGE_KEY = 'character-card-data';

// 画像以外のデータを保存する型
type SavedCardData = Omit<CardData, 'image'>;

function loadFromStorage(): Partial<SavedCardData> | null {
	if (!browser) return null;
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) {
			return JSON.parse(saved) as Partial<SavedCardData>;
		}
	} catch (e) {
		console.warn('Failed to load from localStorage:', e);
	}
	return null;
}

function saveToStorage(data: CardData): void {
	if (!browser) return;
	try {
		// 画像以外のデータを保存
		const toSave: SavedCardData = {
			characterName: data.characterName,
			dataCenter: data.dataCenter,
			world: data.world,
			playStyle: data.playStyle,
			loginTime: data.loginTime,
			design: data.design
		};
		localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
	} catch (e) {
		console.warn('Failed to save to localStorage:', e);
	}
}

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
		croppedArea: null
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
	// LocalStorageから復元したデータをマージ
	const saved = loadFromStorage();
	const initialData: CardData = saved
		? {
				...structuredClone(initialCardData),
				...saved,
				// playStyle, loginTime, designはネストしているのでdeep merge
				playStyle: { ...initialCardData.playStyle, ...saved.playStyle },
				loginTime: { ...initialCardData.loginTime, ...saved.loginTime },
				design: {
					...initialCardData.design,
					...saved.design,
					textPosition: {
						...initialCardData.design.textPosition,
						...saved.design?.textPosition
					}
				}
			}
		: structuredClone(initialCardData);

	let cardData = $state<CardData>(initialData);

	// 変更時に自動保存
	function save() {
		saveToStorage(cardData);
	}

	return {
		get data() {
			return cardData;
		},
		get canExport() {
			return cardData.characterName.trim().length > 0 && cardData.image.src !== null;
		},
		get missingRequirements(): string[] {
			const missing: string[] = [];
			if (cardData.characterName.trim().length === 0) {
				missing.push('キャラクター名');
			}
			if (cardData.image.src === null) {
				missing.push('画像');
			}
			return missing;
		},
		updateCharacterName(name: string) {
			cardData.characterName = name;
			save();
		},
		updateDataCenter(dc: string) {
			cardData.dataCenter = dc;
			cardData.world = '';
			save();
		},
		updateWorld(world: string) {
			cardData.world = world;
			save();
		},
		updateImage(src: string) {
			cardData.image.src = src;
			cardData.image.rotation = 0;
			cardData.image.croppedArea = null;
		},
		updateRotation(rotation: 0 | 90 | 180 | 270) {
			cardData.image.rotation = rotation;
			cardData.image.croppedArea = null;
		},
		updateCroppedArea(area: CroppedArea) {
			cardData.image.croppedArea = area;
		},
		toggleContent(content: CardData['playStyle']['contents'][number]) {
			const idx = cardData.playStyle.contents.indexOf(content);
			if (idx === -1) {
				cardData.playStyle.contents.push(content);
			} else {
				cardData.playStyle.contents.splice(idx, 1);
			}
			save();
		},
		updateAttitude(attitude: CardData['playStyle']['attitude']) {
			cardData.playStyle.attitude = attitude;
			save();
		},
		toggleJob(jobId: string) {
			const idx = cardData.playStyle.jobs.indexOf(jobId);
			if (idx === -1) {
				cardData.playStyle.jobs.push(jobId);
			} else {
				cardData.playStyle.jobs.splice(idx, 1);
			}
			save();
		},
		toggleDay(day: CardData['loginTime']['days'][number]) {
			const idx = cardData.loginTime.days.indexOf(day);
			if (idx === -1) {
				cardData.loginTime.days.push(day);
			} else {
				cardData.loginTime.days.splice(idx, 1);
			}
			save();
		},
		toggleTime(time: CardData['loginTime']['times'][number]) {
			const idx = cardData.loginTime.times.indexOf(time);
			if (idx === -1) {
				cardData.loginTime.times.push(time);
			} else {
				cardData.loginTime.times.splice(idx, 1);
			}
			save();
		},
		updateTheme(theme: 'dark' | 'light') {
			cardData.design.theme = theme;
			save();
		},
		updateOrientation(orientation: 'landscape' | 'portrait') {
			cardData.design.orientation = orientation;
			save();
		},
		updateTextPosition(
			vertical: 'top' | 'center' | 'bottom',
			horizontal: 'left' | 'center' | 'right'
		) {
			cardData.design.textPosition.vertical = vertical;
			cardData.design.textPosition.horizontal = horizontal;
			save();
		},
		reset() {
			cardData = structuredClone(initialCardData);
			if (browser) {
				localStorage.removeItem(STORAGE_KEY);
			}
		}
	};
}

export const cardStore = createCardStore();
