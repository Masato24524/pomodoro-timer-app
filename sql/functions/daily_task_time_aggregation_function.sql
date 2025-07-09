create or replace function sum_task_daily_times(
  start_date date,
  end_date date,
  timezone_name text  
)
returns table (
  task_date date,
  total_hours numeric(5,2) --5桁、小数点第二位まで
) as $$
begin
  return query
  SELECT
    (start_time + INTERVAL '9 hours')::date as task_date,
    ROUND(SUM(task_time) / 3600.0, 2) as total_hours
  FROM sub_tasks
  WHERE start_time IS NOT NULL
    AND (start_time + INTERVAL '9 hours')::date >= start_date
    AND (start_time + INTERVAL '9 hours')::date <= end_date
  GROUP BY (start_time + INTERVAL '9 hours')::date
  ORDER BY (start_time + INTERVAL '9 hours')::date ASC;
end;
$$ language plpgsql;
