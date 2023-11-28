import { apiGetAction, getIdForService, Subcommand } from "../_helpers.ts";
import { getConfig } from "../../config/index.ts";
import { getRequestJSON } from "../../api/index.ts";
import { getLogger } from "../../util/logging.ts";

const desc = 
`Fetches full details about a single service.`;

export const servicesShowCommand =
  new Subcommand()
    .name('list')
    .description(desc)
    .group("Presentational controls")
    .group("API parameters")
    .option("--id <serviceId:string>", "the service ID (e.g. `srv-12345`)")
    .option("--name <serviceName:string>", "the service name (e.g. `hello-world`)")
    .action((opts) => apiGetAction({
      processing: async () => {
        const cfg = await getConfig();
        const logger = await getLogger();
        const serviceId = await getIdForService(cfg, opts);

        logger.debug("dispatching getRequestJSON");
        const ret = await getRequestJSON(
          logger,
          cfg,
          `/services/${serviceId}`,
        );

        return ret;
      },
    }
  )
);
