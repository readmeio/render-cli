import { getConfig, validateRegion } from "../../config/index.ts";
import { runSSH } from "../../services/ssh/index.ts";
import { getLogger } from "../../util/logging.ts";
import { Subcommand, getIdForService } from "./../_helpers.ts";

const desc = 
`Opens a SSH session to a Render service.

This command wraps your local \`ssh\` binary and passes any additional command line arguments to that binary. Before invoking \`ssh\`, \`render ssh\` ensures that your local known hosts are updated with current fingerprints for Render services, reducing the likelihood of a TOFU (trust-on-first-use) attack.`;

export const servicesSshCommand =
  new Subcommand()
    .name('ssh')
    .description(desc)
    .arguments("[sshArgs...:string]")
    .stopEarly() // args after the service name will not be parsed, including flags
    .option("--preserve-hosts", "Do not update ~/.ssh/known_hosts with Render public keys.")
    .option("--id <serviceId>", "The ID of the service to access via SSH.")
    .option("--name <serviceName>", "The name of the service to access via SSH.")
    .action(async (opts, ...sshArgs) => {
      const logger = await getLogger();
      const config = await getConfig();
      const serviceId = await getIdForService(config, opts.id, opts.name);

      const status = await runSSH({
        config,
        serviceId,
        region: validateRegion(opts.region ?? config.profile.defaultRegion),
        sshArgs: sshArgs ?? [],
        noHosts: opts.preserveHosts ?? config.fullConfig.sshPreserveHosts ?? false,
      });
      
      if (!status.success) {
        logger.error(`Underlying SSH failure: exit code ${status.code}, signal ${status.signal ?? 'none'}`);
      }
      Deno.exit(status.code);
    });
