import * as TbaApi from "tba-api-v3client-ts";
import { TbaKey } from "$lib/keys.json";

TbaApi.OpenAPI.HEADERS = {
    "X-TBA-Auth-Key": TbaKey,
};

export default TbaApi;