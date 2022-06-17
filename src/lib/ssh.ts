import { NodeSSH } from "node-ssh";
import fs from "fs";
import chalk from "chalk";

let ssh: NodeSSH;

declare global {
   var ssh: NodeSSH | undefined;
}

if (process.env.NODE_ENV === "production") {
   ssh = new NodeSSH();
} else {
   if (!global.ssh) {
      global.ssh = new NodeSSH();
   }
   ssh = global.ssh;
}
export default ssh;

export const connect = async () => {
   console.log(chalk.gray.bold("Trying to connect to the SSH Server..."));
   try {
      await connectToSSH();
      console.log(
         chalk.green.bold("Successfully connected to the SSH Server!")
      );
   } catch (error) {
      throw new Error(
         `Failed to connect to SSH server! Are your credentials correct?`
      );
   }
};

const connectToSSH = async (): Promise<NodeSSH> => {
   const key = Buffer.from(process.env.SSH_PRIVATE_KEY as string, "base64");
   const path = __dirname + "/id_rsa";
   fs.writeFileSync(path, key);
   const connect = await ssh.connect({
      host: process.env.SSH_IP,
      username: "root",
      privateKey: path,
   });
   fs.unlinkSync(path);
   return connect;
};
