create or replace function sum_task_daily_times(
  start_date date,
  end_date date,
  timezone_name text  
)
returns table (
  task_date date,
  total_seconds bigint,
  total_hours numeric(5,2) --5桁、小数点第二位まで
) as $$
begin
  return query
  SELECT
    DATE(start_time) as task_date,
    SUM(task_time) as total_minutes,
    ROUND(SUM(task_time) / 3600.0, 2) as total_hours
  FROM sub_tasks
  WHERE start_time IS NOT NULL
    AND DATE(start_time) >= start_date
    AND DATE(start_time) <= end_date
  GROUP BY DATE(start_time)
  ORDER BY DATE(start_time) ASC;
end;
$$ language plpgsql;
