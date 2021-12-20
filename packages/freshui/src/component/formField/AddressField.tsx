import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, WidgetsFactory } from "@itsy-ui/core";
import * as React from "react";
import { FormControl, InputGroup } from "react-bootstrap";
import { getlocaleText } from "../../utils/helper";

interface IAddressOptions { address1: string, address2: string, country: string, state: string, city: string, pin: string };
const addressOptions: IAddressOptions = { address1: "", address2: "", country: "", state: "", city: "", pin: "" };
class AddressField extends React.Component<IWidgetControlProps, {}> {
	state = {
		addressValue: {
			...addressOptions
		}
	}
	getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}
	handleChange(e, id) {
		const controlProps = this.getControlSchemaProperties();
		const value = { ...this.state.addressValue, [id]: e.target.value };
		this.setState({ addressValue: value });
		controlProps.handleChange(e, value);
	}

	render() {
		return (<>
			<InputGroup className="mb-3">
				<FormControl
					id={"address1"}
					type={"string"}
					label={getlocaleText("{{address1}}")}
					onChange={(e) => this.handleChange && this.handleChange(e, "address1")}
					tabIndex={0}
					aria-label={getlocaleText("{{address1}}")}
				/>
			</InputGroup>
			<InputGroup className="mb-3">
				<FormControl
					id={"address2"}
					type={"string"}
					label={getlocaleText("{{address2}}")}
					onChange={(e) => this.handleChange && this.handleChange(e, "address2")}
					tabIndex={0}
					aria-label={getlocaleText("{{address2}}")}
				/>
			</InputGroup>
			<div className="address-container">
				<InputGroup className="mb-3">
					<FormControl
						id={"country"}
						type={"string"}
						label={getlocaleText("{{country}}")}
						className="address-textBox"
						onChange={(e) => this.handleChange && this.handleChange(e, "country")}
						tabIndex={0}
						aria-label={getlocaleText("{{country}}")}
					/>
				</InputGroup>
				<InputGroup className="mb-3">
					<FormControl
						id={"state"}
						type={"string"}
						label={getlocaleText("{{state}}")}
						onChange={(e) => this.handleChange && this.handleChange(e, "state")}
						tabIndex={0}
						aria-label={getlocaleText("{{state}}")}
					/>
				</InputGroup>
			</div>
			<div className="address-container">
				<InputGroup className="mb-3">
					<FormControl
						id={"city"}
						type={"string"}
						label={getlocaleText("{{city}}")}
						className="address-textBox"
						onChange={(e) => this.handleChange && this.handleChange(e, "city")}
						tabIndex={0}
						aria-label={getlocaleText("{{city}}")}
					/>
				</InputGroup>
				<InputGroup className="mb-3">
					<FormControl
						id={"pin"}
						type={"number"}
						label={getlocaleText("{{pin}}")}
						onChange={(e) => this.handleChange && this.handleChange(e, "pin")}
						tabIndex={0}
						aria-label={getlocaleText("{{pin}}")}
					/>
				</InputGroup>
			</div>
		</>
		);
	}
}

AddressField['displayName'] = 'addressField';

WidgetsFactory.instance.registerFactory(AddressField);
WidgetsFactory.instance.registerControls({
	addressField: 'AddressField',
	"itsy:form:address": 'AddressField'
});

export default AddressField;