
export const PageContainerActions = {
	UpdateData: "UpdateData"
};

export function doPageContainerInit(event: any) {
	return (_, _dispatch, transition) => {
		const { pageId, components, layout, currentPageQueryParams, queryParams, designerMetadata, pagesPath, controlID } = event;
		transition({
			type: "PAGE_CONTAINER_LOAD",
			controlID,
			strict: true,
			pageId, components, layout, currentPageQueryParams, queryParams, designerMetadata, pagesPath
		});
	};
}

export function doPageContainerLoad(event: any) {
	return (_, dispatch, transition) => {
		const { pageId, components, layout, currentPageQueryParams, queryParams, designerMetadata, pagesPath, controlID } = event;
		dispatch({
			type: PageContainerActions.UpdateData,
			pageId, components, layout, currentPageQueryParams, queryParams, designerMetadata, pagesPath
		});
		transition({
			type: "PAGE_CONTAINER_LOADED",
			controlID,
			strict: true,
		});
	};
}