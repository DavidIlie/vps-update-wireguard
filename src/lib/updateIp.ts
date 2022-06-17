import chalk from "chalk";
import fs from "fs";

import ssh from "./ssh";
import { getIpV4Address } from "./getIp";

export const testFile = async (): Promise<boolean> => {
   console.log(
      chalk.gray.bold(
         `Testing WireGuard configuration file at "${process.env.SSH_WG_FILE}"`
      )
   );
   try {
      await ssh.exec(`ls ${process.env.SSH_WG_FILE}`, []);
      console.log(
         chalk.green.bold(
            "Successfully found the WireGuard Configuration file!"
         )
      );
      return true;
   } catch (error) {
      throw new Error(
         `Failed to find WireGuard configuration file! Make sure it's the right path!`
      );
   }
};

export const updateIpAddress = async (ipAddress?: string, skipTest = false) => {
   if (!skipTest) await testFile();
   try {
      let ip = ipAddress || (await getIpV4Address());

      if (!ipAddress)
         console.log(chalk.gray.bold(`Gotten IP Address as ${ip}...`));

      const file = await ssh.exec(`cat ${process.env.SSH_WG_FILE}`, []);

      let fileArray = file.split("\n");

      let foundIndex = -1;
      fileArray.forEach(
         (val, index) => val.includes("Endpoint =") && (foundIndex = index)
      );

      if (foundIndex === -1) {
         ssh.dispose();
         throw new Error();
      }

      let string = fileArray[foundIndex];

      let finalIp;
      try {
         let splitString = string.split("Endpoint = ");
         let firstSplitted = splitString[1];
         let splitFirst = firstSplitted.split(`:${process.env.WG_PORT}`);
         finalIp = splitFirst[0];
      } catch (error) {
         throw new Error(
            `Failed to parse WireGuard Configuration file! Please make sure it's structured as "Endpoint = *ip address*:*port*"`
         );
      }

      if (finalIp === ip) {
         console.log(
            chalk.green.bold(
               `Successfully parsed WireGuard Configuration file! ${chalk.gray.bold(
                  "Didn't update file though, IPs are the same..."
               )}`
            )
         );
         console.log(chalk.gray.bold("Disconnecting SSH for now..."));
         return ssh.dispose();
      }

      console.log(
         chalk.gray.bold("Copying current file to /tmp/backupwireguard.conf...")
      );
      await ssh.exec(
         `cp ${process.env.SSH_WG_FILE} /tmp/backupwireguard.conf`,
         []
      );

      string = string.replace(new RegExp(finalIp, "g"), ip);
      fileArray[foundIndex] = string;
      const finalFileString = fileArray.join("\n") + "\n";

      console.log(chalk.gray.bold("Deleting current file..."));
      await ssh.exec(`rm -rf ${process.env.SSH_WG_FILE}`, []);
      console.log(chalk.gray.bold("Creating new file..."));
      const path = __dirname + "/wg0.conf";
      fs.writeFileSync(path, finalFileString);
      await ssh.putFile(path, process.env.SSH_WG_FILE as string);
      fs.unlinkSync(path);
      console.log(chalk.gray.bold("Deleting backup file..."));
      await ssh.exec(`rm -rf /tmp/backupwireguard.conf`, []);
      console.log(chalk.gray.bold("Restarting WireGuard service..."));
      await ssh.exec(
         `sudo systemctl restart ${process.env.WG_SERVICE_NAME}`,
         []
      );
      console.log(
         chalk.green.bold(
            `Successfully updated IP from ${finalIp} to ${ip}! ${chalk.gray.bold(
               "Disconnecting SSH for now..."
            )} `
         )
      );

      ssh.dispose();
   } catch (error) {
      console.log(error);
      console.log(chalk.red.bold("Something happened, Reverting Changes..."));
      await ssh.exec(`rm -rf ${process.env.SSH_WG_FILE}`, []);
      await ssh.exec(
         `mv /tmp/backupwireguard.conf ${process.env.SSH_WG_FILE}`,
         []
      );
      throw new Error(
         `Failed to update the WireGuard configuration file! Is it the right format?`
      );
   }
};
