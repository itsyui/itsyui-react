import React from "react";

function UnsupportedField({ schema, reason }) {
	let schemaJSON = reason;
	try {
		schemaJSON = JSON.stringify(schema, null, 2);
	} catch (error) {
	}
	return (
		<div className="unsupported-field">
			<p>
				{reason && <div dangerouslySetInnerHTML={{
					__html: reason
				}}></div>}
			</p>
			{schema && <pre>{schemaJSON}</pre>}
		</div>
	);
}

export default UnsupportedField;
