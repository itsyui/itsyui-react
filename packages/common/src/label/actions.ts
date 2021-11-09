export function doLabelBeforeRefresh(event?: any) {
	return (_, _dispatch: any, transition: any) => {
		const { title, controlID } = event;
		transition({
			type: "LABEL_REFRESH",
			title: title,
			controlID: controlID
		});
	};
}

export function doLabelRefresh(event: any) {
	return (_, dispatch: any, transition: any) => {
		const { title } = event;
		dispatch({
			type: "UPDATE_LABEL",
			title: title !== undefined ? title : "",
		});
		transition({
			type: "LABEL_REFRESH_DONE",
		});
	};
}
