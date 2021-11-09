import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, WidgetsFactory } from "@itsy-ui/core";
import * as React from "react";
import Image from "react-bootstrap/Image";

function _getCurrentUserInfo(data, isLocal) {
	try {
		const userBTOA = localStorage.getItem("USER_LOCAL");
		return isLocal && data ? data.split(' ') : userBTOA ? atob(userBTOA).split(":") : undefined;
	} catch (error) {
		return undefined;
	}
}

const AvatarComponent = props => {
	const { value, isLocal } = props
	if (value && value.includes("base64")) {
		return <div className="base64-img"><Image roundedCircle className={"image_style"} src={value} /></div>;
	}
	const loggedInUser = _getCurrentUserInfo(value, isLocal);
	return (Array.isArray(loggedInUser) && loggedInUser.length > 0 ?
		<div className="text-avatar-icon" >
			{loggedInUser[0].substr(0, 2)}
		</div > : null
	);
};
class AvaterIcon extends React.Component<IWidgetControlProps, {}> {

	_getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	render() {
		const { data, value, isLocal } = this._getControlSchemaProperties();

		return (
			<AvatarComponent
				data={data}
				value={value}
				isLocal={isLocal}
				{...this.props}
			/>
		);
	}
}

AvaterIcon["displayName"] = 'Avatar';

WidgetsFactory.instance.registerFactory(AvaterIcon);
WidgetsFactory.instance.registerControls({
	avatar_icon_control: 'Avatar',
	"itsy:ui:avatar": 'Avatar'
});