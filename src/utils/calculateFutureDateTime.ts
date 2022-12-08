import { add, Duration } from 'date-fns';

// https://date-fns.org/v2.29.3/docs/add

export const calculateFutureDateTime = (duration: Duration) =>
  add(Date.now(), duration);
