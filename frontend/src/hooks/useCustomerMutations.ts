import { useMutation, useQueryClient } from "@tanstack/react-query";

import { customerApi } from "../services/customerApi";
import type { Customer, CustomerPayload } from "../types/customer";
import { CUSTOMER_QUERY_KEYS } from "./useCustomers";

export const useCustomerMutations = () => {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.all });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CustomerPayload) => customerApi.create(payload),
    onSuccess: async (createdCustomer) => {
      queryClient.setQueryData<Customer[]>(CUSTOMER_QUERY_KEYS.all, (previous) =>
        previous ? [createdCustomer, ...previous] : [createdCustomer],
      );
      await invalidate();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CustomerPayload }) =>
      customerApi.update(id, payload),
    onSuccess: async (_data, variables) => {
      queryClient.setQueryData<Customer[]>(CUSTOMER_QUERY_KEYS.all, (previous) =>
        previous?.map((item) => (item.id === variables.id ? { ...item, ...variables.payload } : item)) ??
        previous,
      );
      await invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customerApi.delete(id),
    onSuccess: async () => {
      await invalidate();
    },
  });

  return { createMutation, updateMutation, deleteMutation };
};
