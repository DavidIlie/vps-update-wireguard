require("dotenv").config();
import chalk from "chalk";
import cron from "node-cron";

import { connect } from "./lib/ssh";
import { getIpV4Address } from "./lib/getIp";
import { testFile, updateIpAddress } from "./lib/updateIp";

const main = async () => {
   console.log(chalk.gray.bold("Trying to fetch Public IP address..."));
   let ipAddress;
   try {
      ipAddress = await getIpV4Address();
      console.log(
         chalk.green.bold(`Successfully found Public IP as ${ipAddress}!`)
      );
   } catch (error) {
      throw new Error(
         "Failed to get Public IP Address! Are you properly connected to the internet?"
      );
   }

   await connect();
   await testFile();

   console.log(
      chalk.gray.bold("Trying to parse WireGuard configuration file...")
   );
   await updateIpAddress(ipAddress, true);

   console.log(
      chalk.green.bold(
         `\nTests completed! ${chalk.gray.bold("Starting cron job...\n")}`
      )
   );

   cron.schedule("*/1 * * * *", async () => {
      console.log(chalk.blue.bold("Triggered cron job..."));
      await connect();
      await updateIpAddress(undefined, false);
      console.log(chalk.blue.bold("Completed cron job!\n"));
   });
};

main();
