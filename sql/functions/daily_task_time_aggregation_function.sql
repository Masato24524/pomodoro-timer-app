[?25l
    Select a project:                                                                                     
                                                                                                          
  >  1. agjpspwbmfqyelxlitia [name: pomodoro-timer-app, org: hxzeeukwfprztgpzbngu, region: ap-northeast-1]
    2. xzgrgmqyeikapilkierw [name: fullstack-blog-yt, org: hxzeeukwfprztgpzbngu, region: ap-northeast-1]  
                                                                                                          
                                                                                                          
    ↑/k up • ↓/j down • / filter • q quit • ? more                                                        
                                                                                                          [0D[2K[1A[2K[1A[2K[1A[2K[1A[2K[1A[2K[1A[2K[1A[2K[1A[0D[2K [0D[2K[?25h[?1002l[?1003l[?1006lcreate or replace function sum_task_daily_times(
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
  GROUP BY DATE(start_time)
  ORDER BY DATE(start_time) ASC;
end;
$$ language plpgsql;
