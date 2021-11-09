import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, SchemaContainer, WidgetsFactory, withReducer } from '@itsy-ui/core';
import * as React from "react";
import { useEffect, useRef } from "react";
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { BsColumnsGap, BsSearch } from 'react-icons/bs';
import { Observable } from 'rx-lite';
import { getDeviceType, getlocaleText, isEnvContainsKey } from "../../utils/helper";

function getValue(searchInput, schema) {
	if (searchInput.current) {
		searchInput["current"]["value"] = schema.value !== undefined ? schema.value : searchInput.current.value ? searchInput.current.value : ""
	}
}
const SearchComponent = props => {
	const { onChange, schema, transition } = props;
	const searchInput = useRef(null);
	const updateValue = getValue(searchInput, schema)
	const deviceType = getDeviceType()
	const matches = deviceType !== "desktop" ? false : true;
	const rootclass = matches ? "mobileInputRoot" : "inputRoot";
	const scanQR = () => {
		const { controlID } = schema;
		// tslint:disable-next-line: no-unused-expression
		isEnvContainsKey("tablet") && transition({
			...controlID && {
				controlID,
				strict: true,
			},
			type: "SEARCH_WITH_QR",
		});
	};
	useEffect(() => {
		if (searchInput && searchInput.current) {
			Observable.fromEvent(searchInput.current, "keyup")
				.map(x => x.currentTarget.value)
				.debounce(1000)
				.subscribe(x => onChange(x));
		}
	}, []);

	return (
		<div className={props.className ? `search search-align ${props.className}` : "search search-align"} style={props.style ? props.style : {}}>
			<Form>
				<InputGroup className="mb-2">
					<InputGroup.Prepend>
						<InputGroup.Text>
							{!schema.enableQRScan && <BsSearch />}
							{schema.enableQRScan && <BsColumnsGap />}
						</InputGroup.Text>
					</InputGroup.Prepend>
					<Form.Control size="lg" type="text"
						placeholder={getlocaleText(schema.placeholder)}
						ref={searchInput}
					/>
				</InputGroup>
			</Form>
		</div >
	);
};

class SearchControl extends React.Component<IWidgetControlProps, {}> {

	onChange = (value) => {
		const { controlID } = this._getControlSchemaProperties();
		this.props.transition({
			...controlID && {
				controlID,
				strict: true,
			},
			type: "SEARCH_CLICKED",
			data: value,
		});
	}
	_getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	render() {
		const { className, style } = this._getControlSchemaProperties();
		return <SearchComponent
			onChange={this.onChange}
			{...this.props}
			className={className}
			style={style} />;
	}
}

const mapDispatchToProps = (dispatch) => {
	return {};
};

const SearchC = withReducer('Search', mapDispatchToProps)(SearchControl);
SearchC.displayName = 'Search';

WidgetsFactory.instance.registerFactory(SearchC);
WidgetsFactory.instance.registerControls({
	grid_search: 'Search',
	'itsy:ui:search': 'Search'
});

export default SearchControl;
