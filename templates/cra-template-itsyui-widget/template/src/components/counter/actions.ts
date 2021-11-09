export function doBeforeCounterInc(_evt: any) {
	return async (_getState: any, _dispatch: any, transition: any) => {
		transition({
			type: "UP_COUNT"
		});
	};
}

export function doCounterInc(_evt: any) {
	return async (_getState: any, dispatch: any, transition: any) => {
		dispatch({
			type: "ADD"
		});
		transition({
			type: "ON_LOADED"
		})
	};
}

export function doCounterDec(_evt: any) {
	return async (_: any, dispatch: any, transition: any) => {
		dispatch({
			type: "DEC"
		});
		transition({
			type: "ON_LOADED"
		})
	};
}
