import { StateManagerContext } from "@itsy-ui/core";
import { ItsyGrid } from '@itsy-ui/data';
import "../handlers/navigationHandler";

const gridSchema = {
    "id": "master_detail",
    "viewAttributes": {
        "attributes": {
            listType: "simpleHorizontal",
            primary: "name",
            secondary: "description",
        }
    },
    "propertyDefinitions": {
        "id": {
            "id": "id",
            "displayName": "ID",
        },
        "name": {
            "id": "name",
            "displayName": "Product Name",
            "propertyType": "string"
        },
        "description": {
            "id": "description",
            "displayName": "Description",
            "propertyType": "string"
        },
        "profile": {
            "id": "profile",
            "displayName": "Profile",
        }
    }
};

const schema = {
    typeId: "md",
    gridSchema: gridSchema,
    dataSource: "datasource",
    gridViewType: "List",
    controlID: "master_details"
}

const Home: React.FC = () => {
    return (
        <StateManagerContext.Provider key="grid-context" value={{ contextPath: { "id": "master_details" } }}>
            <ItsyGrid className="grid" schema={schema} />
        </StateManagerContext.Provider>
    );
};

export default Home;
