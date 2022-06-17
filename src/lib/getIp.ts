import fetch from "node-fetch";

export const getIpV4Address = async (): Promise<string> => {
   try {
      const r = await fetch("https://api.ipify.org/?format=json");
      const response = (await r.json()) as any;
      if (r.status !== 200) throw new Error(response);
      return response.ip;
   } catch (error) {
      throw new Error(error);
   }
};
