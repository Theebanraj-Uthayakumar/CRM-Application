import { useQuery } from "@tanstack/react-query";

import { customerApi } from "../services/customerApi";

export const CUSTOMER_QUERY_KEYS = {
  all: ["customers"] as const,
};

export const useCustomers = () => {
  return useQuery({
    queryKey: CUSTOMER_QUERY_KEYS.all,
    queryFn: customerApi.list,
  });
};
