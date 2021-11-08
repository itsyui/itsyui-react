import { SideBarActions } from './actions';

function getDeviceType() {
	const ua = navigator.userAgent;
	if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
		return "tablet";
	}
	if (
		/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
			ua
		)
	) {
		return "mobile";
	}
	return "desktop";
}

const initialState = {
	data: [],
	selectedKey: [],
	isExpand: getDeviceType() !== "desktop" ? false : true,
};

function reducer(state, action) {

	switch (action.type) {
		case SideBarActions.LoadMetadata:
			return {
				...state,
				data: action.data,
				selectedKey: state.selectedKey ? state.selectedKey : action.data[0]
			};
		case SideBarActions.UpdateSelectedItem:
			return {
				...state,
				selectedKey: action.selectedItem,
			};
		case SideBarActions.Toggle:
			return {
				...state,
				isExpand: action.isExpand !== undefined && action.isExpand !== null ? action.isExpand : !state.isExpand,
			};
		default:
			return state === undefined ? initialState :
				Object.keys(state).length === 0 ? initialState : state;
	}
}

export default reducer;
