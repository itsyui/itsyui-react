import { AppContainerActions } from './actions';

const initialState = {
	loaded: false,
	hiddenRegions: [],
	rootContainerElements: [],
	appSchema: null,
};

function reducer(state, action) {
	switch (action.type) {
		case AppContainerActions.UpdateVisible:
			return {
				...state,
				hiddenRegions: state.hiddenRegions.filter(t => t !== action.regionName)
			};
		case AppContainerActions.UpdateHide:
			return {
				...state,
				hiddenRegions: [...state.hiddenRegions, action.regionName]
			};
		case AppContainerActions.AddRootElements:
			return {
				...state,
				rootContainerElements: action.rootContainerElements,
				loaded: action.loaded,
			};
		case AppContainerActions.UpdatelayoutType:
			return {
				...state,
				layoutType: action.layoutType,
			};
		case AppContainerActions.UpdateAppSchema:
			return {
				...state,
				appSchema: action.appSchema.properties,
			};
		default:
			return state === undefined ? initialState :
				Object.keys(state).length === 0 ? initialState : state;
	}
}

export default reducer;