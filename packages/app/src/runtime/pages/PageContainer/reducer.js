import { PageContainerActions } from "./actions";

const initialState = {
	isLoaded: false,
};

function reducer(state, action) {
	switch (action.type) {
		case PageContainerActions.UpdateData:
			return {
				...state,
				isLoaded: true,
				pageId: action.pageId,
				components: action.components,
				layout: action.layout,
				currentPageQueryParams: action.currentPageQueryParams,
				queryParams: action.queryParams,
				designerMetadata: action.designerMetadata,
				pagesPath: action.pagesPath,
			}
		default:
			return state === undefined ? {} :
				Object.keys(state).length === 0 ? initialState : state;
	}
}


export default reducer;