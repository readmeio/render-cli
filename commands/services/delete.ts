import { getIdForService, standardAction, Subcommand } from "../_helpers.ts";
import { getConfig } from "../../config/index.ts";
import { deleteRequestRaw } from "../../api/index.ts";
import { getLogger } from "../../util/logging.ts";

const desc = `Deletes a service`;

export const servicesDeleteCommand = new Subcommand()
  .name("list")
  .description(desc)
  .group("API parameters")
  .option("--id <serviceId:string>", "the service ID (e.g. `srv-12345`)")
  .option("--name <serviceName:string>", "the service name (e.g. `hello-world`)")
  .action((opts) =>
    standardAction({
      exitCode: (res) => (res?.status == 204 ? 0 : 1),
      interactive: () => undefined,
      processing: async () => {
        const cfg = await getConfig();
        const logger = await getLogger();
        const serviceId = await getIdForService(cfg, opts.id, opts.name);

        const ret = await deleteRequestRaw(logger, cfg, `/services/${serviceId}`);
        logger.debug(`deleted service ${opts.serviceName || serviceId}: ${ret.status}`);

        return ret;
      },
    })
  );
