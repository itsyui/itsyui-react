export const getValue = (p, o) =>
	p.reduce((xs, x) =>
		(xs && xs[x]) ? xs[x] : null, o);

export const setValue = (propertyPath, value, obj) => {
	// this is a super simple parsing, you will want to make this more complex to handle correctly any path
	// it will split by the dots at first and then simply pass along the array (on next iterations)
	const properties = Array.isArray(propertyPath) ? propertyPath : propertyPath.split("/");

	// Not yet at the last property so keep digging
	if (properties.length > 1) {
		// The property doesn't exists OR is not an object (and so we overwritte it) so we create it
		if (!obj.hasOwnProperty(properties[0]) || typeof obj[properties[0]] !== "object") {
			obj[properties[0]] = {};
		}
		// We iterate.
		return setValue(properties.slice(1), value, obj[properties[0]]);
		// This is the last property - the one where to set the value
	} else {
		// We set the value to the last property
		obj[properties[0]] = value;
		return true; // this is the end
	}
};
