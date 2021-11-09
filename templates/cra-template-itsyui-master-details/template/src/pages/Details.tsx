import { useEffect, useState } from "react";
import { WidgetsFactory } from "@itsy-ui/core";
import { getUrlParamValue } from "@itsy-ui/utils";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"];
const Details: React.FC<{}> = () => {
    const [item, setItem] = useState({ description: "" });
    const datasource = dataLoader.getLoader("datasource");

    useEffect(() => {
        const id = getUrlParamValue("id");
        const data = datasource.getObject(null, id);
        setItem(data);
    }, []);

    return item && <div>
        {item.description}
    </div>;
}

export default Details;
