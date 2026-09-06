import React, { useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, ChevronRight, ClipboardList, Plus, TriangleAlert, X } from 'lucide-react';
import { Member, ScheduleItem, TaskItem, TaskPriority, TaskStatus } from '../../types';

interface TaskScheduleTabProps {
  tasks: TaskItem[];
  schedules: ScheduleItem[];
  members: Member[];
  onCreateTask: (task: Omit<TaskItem, 'id' | 'createdAt'>) => void;
  onMoveTask: (taskId: string, status: TaskStatus) => void;
  onCreateSchedule: (schedule: Omit<ScheduleItem, 'id'>) => string | undefined;
}

const columns: { status: TaskStatus; label: string }[] = [
  { status: 'BACKLOG', label: 'Backlog' },
  { status: 'TODO', label: 'To-do' },
  { status: 'IN_PROGRESS', label: 'Đang làm' },
  { status: 'IN_REVIEW', label: 'Chờ duyệt' },
  { status: 'DONE', label: 'Hoàn thành' },
];

const priorityTone: Record<TaskPriority, string> = {
  LOW: 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400',
  MEDIUM: 'border-sky-200 dark:border-sky-900/60 bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400',
  HIGH: 'border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400',
  URGENT: 'border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400',
};

export const TaskScheduleTab: React.FC<TaskScheduleTabProps> = ({
  tasks,
  schedules,
  members,
  onCreateTask,
  onMoveTask,
  onCreateSchedule,
}) => {
  const [view, setView] = useState<'KANBAN' | 'SCHEDULE' | 'TIMELINE' | 'GANTT' | 'GRID'>('KANBAN');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('MEDIUM');
  const [taskAssigneeId, setTaskAssigneeId] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleUserId, setScheduleUserId] = useState(members[0]?.id ?? '');
  const [scheduleStart, setScheduleStart] = useState('');
  const [scheduleEnd, setScheduleEnd] = useState('');
  const [scheduleError, setScheduleError] = useState('');

  const activeTasks = tasks.filter((task) => task.status !== 'DONE');
  const overdueTasks = activeTasks.filter((task) => task.dueDate && new Date(task.dueDate).getTime() < Date.now());
  const workloadByMember = useMemo(() => {
    return members.map((member) => ({
      member,
      count: activeTasks.filter((task) => task.assigneeId === member.id).length,
    })).sort((left, right) => right.count - left.count);
  }, [activeTasks, members]);
  const selectedTask = tasks.find((task) => task.id === selectedTaskId);

  const handleCreateTask = (event: React.FormEvent) => {
    event.preventDefault();
    if (!taskTitle.trim()) return;
    const assignee = members.find((member) => member.id === taskAssigneeId);
    onCreateTask({
      title: taskTitle.trim(),
      description: '',
      status: 'TODO',
      priority: taskPriority,
      assigneeId: assignee?.id,
      assigneeName: assignee?.name,
      pointsReward: taskPriority === 'URGENT' ? 50 : taskPriority === 'HIGH' ? 30 : 15,
      dueDate: taskDueDate || undefined,
      updatedAt: new Date().toISOString(),
    });
    setTaskTitle('');
    setTaskDueDate('');
  };

  const handleCreateSchedule = (event: React.FormEvent) => {
    event.preventDefault();
    setScheduleError('');
    const user = members.find((member) => member.id === scheduleUserId);
    if (!user || !scheduleTitle.trim() || !scheduleStart || !scheduleEnd) return;
    const startTime = new Date(scheduleStart).getTime();
    const endTime = new Date(scheduleEnd).getTime();
    if (endTime <= startTime) {
      setScheduleError('Thời gian kết thúc phải sau thời gian bắt đầu.');
      return;
    }
    const conflict = schedules.some((schedule) => (
      schedule.userId === user.id
      && schedule.status === 'CONFIRMED'
      && startTime < new Date(schedule.endAt).getTime()
      && endTime > new Date(schedule.startAt).getTime()
    ));
    if (conflict) {
      setScheduleError(`Lịch của ${user.name} đang bị trùng thời gian.`);
      return;
    }
    const error = onCreateSchedule({
      title: scheduleTitle.trim(),
      userId: user.id,
      userName: user.name,
      startAt: new Date(scheduleStart).toISOString(),
      endAt: new Date(scheduleEnd).toISOString(),
      status: 'CONFIRMED',
      colorCode: '#0284C7',
      updatedAt: new Date().toISOString(),
    });
    if (error) {
      setScheduleError(error);
      return;
    }
    setScheduleTitle('');
    setScheduleStart('');
    setScheduleEnd('');
  };

  return (
    <div className="space-y-4">
      {/* Header Bento Card */}
      <div className="bento-card p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            Operations planning & dispatch
          </p>
          <h2 className="mt-0.5 text-base font-bold text-slate-900 dark:text-white">
            Công Việc & Lịch Điều Phối Nhân Sự
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            Theo dõi tiến độ Sprint, tải nhân sự và ngăn ngừa lịch trùng trước khi xác nhận.
          </p>
        </div>

        {/* View Switcher: Clinical Segmented */}
        <div className="flex items-center border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-0.5">
          {(['KANBAN', 'SCHEDULE', 'TIMELINE', 'GANTT', 'GRID'] as const).map((modeKey) => (
            <button
              key={modeKey}
              type="button"
              onClick={() => setView(modeKey)}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all ${
                view === modeKey
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              {modeKey === 'KANBAN' ? 'Kanban' : modeKey === 'SCHEDULE' ? 'Lịch & Tải' : modeKey}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="bento-card p-3">
          <p className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">Đang mở</p>
          <strong className="mt-1 block font-mono text-2xl text-slate-900 dark:text-white">{activeTasks.length}</strong>
        </div>
        <div className="bento-card p-3">
          <p className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">Quá hạn</p>
          <strong className="mt-1 block font-mono text-2xl text-rose-600">{overdueTasks.length}</strong>
        </div>
        <div className="bento-card p-3">
          <p className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">Lịch hôm nay</p>
          <strong className="mt-1 block font-mono text-2xl text-sky-600 dark:text-sky-400">
            {schedules.filter((schedule) => new Date(schedule.startAt).toDateString() === new Date().toDateString()).length}
          </strong>
        </div>
        <div className="bento-card p-3">
          <p className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">Tổng điểm thưởng</p>
          <strong className="mt-1 block font-mono text-2xl text-emerald-600 dark:text-emerald-400">
            {tasks.reduce((total, task) => total + task.pointsReward, 0)}
          </strong>
        </div>
      </div>

      {view === 'KANBAN' ? (
        <div className="space-y-4">
          {/* Create Task Form */}
          <form onSubmit={handleCreateTask} className="bento-card p-3 grid grid-cols-1 gap-2 md:grid-cols-[1fr_140px_180px_160px_auto]">
            <input
              required
              value={taskTitle}
              onChange={(event) => setTaskTitle(event.target.value)}
              placeholder="Tên công việc mới..."
              className="border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-sky-600"
            />
            <select
              value={taskPriority}
              onChange={(event) => setTaskPriority(event.target.value as TaskPriority)}
              className="border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900 px-2 py-1.5 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="LOW">Ưu tiên thấp</option>
              <option value="MEDIUM">Ưu tiên vừa</option>
              <option value="HIGH">Ưu tiên cao</option>
              <option value="URGENT">Khẩn cấp</option>
            </select>
            <select
              value={taskAssigneeId}
              onChange={(event) => setTaskAssigneeId(event.target.value)}
              className="border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900 px-2 py-1.5 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="">Chưa giao người</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
            <input
              type="datetime-local"
              value={taskDueDate}
              onChange={(event) => setTaskDueDate(event.target.value)}
              className="border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900 px-2 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-mono"
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-1 bg-sky-600 hover:bg-sky-700 px-4 py-1.5 text-xs font-mono font-bold uppercase text-white transition-colors"
            >
              <Plus size={13} />
              Thêm
            </button>
          </form>

          {/* Kanban Columns */}
          <div className="grid gap-3 xl:grid-cols-5">
            {columns.map((column) => (
              <section
                key={column.status}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (draggedTaskId) onMoveTask(draggedTaskId, column.status);
                  setDraggedTaskId(null);
                }}
                className="min-h-56 bento-card p-2.5 bg-slate-50/50 dark:bg-slate-900/30"
              >
                <div className="mb-2 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {column.label}
                  </h3>
                  <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500">
                    {tasks.filter((task) => task.status === column.status).length}
                  </span>
                </div>

                <div className="space-y-2">
                  {tasks.filter((task) => task.status === column.status).map((task) => (
                    <article
                      key={task.id}
                      draggable
                      onDragStart={() => setDraggedTaskId(task.id)}
                      onDragEnd={() => setDraggedTaskId(null)}
                      onClick={() => setSelectedTaskId(task.id)}
                      className="cursor-grab border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 hover:border-sky-500 dark:hover:border-sky-400 transition-colors active:cursor-grabbing"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <strong className="text-xs leading-tight text-slate-900 dark:text-white">{task.title}</strong>
                        <span className={`shrink-0 px-1 py-0.5 text-[9px] font-mono font-bold border ${priorityTone[task.priority]}`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        <span>{task.assigneeName || 'Chưa giao'}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">+{task.pointsReward}</span>
                      </div>
                      {task.dueDate && (
                        <p className={`mt-1 text-[10px] font-mono ${new Date(task.dueDate).getTime() < Date.now() && task.status !== 'DONE' ? 'text-rose-600' : 'text-slate-400 dark:text-slate-500'}`}>
                          Hạn: {new Date(task.dueDate).toLocaleString('vi-VN')}
                        </p>
                      )}
                      {column.status !== 'DONE' && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onMoveTask(task.id, columns[Math.min(columns.findIndex((item) => item.status === column.status) + 1, columns.length - 1)].status);
                          }}
                          className="mt-2 flex items-center gap-1 text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 hover:underline"
                        >
                          Chuyển bước <ChevronRight size={12} />
                        </button>
                      )}
                    </article>
                  ))}
                  {tasks.filter((task) => task.status === column.status).length === 0 && (
                    <p className="py-8 text-center text-[10px] font-mono text-slate-400 dark:text-slate-600">
                      Chưa có task
                    </p>
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      ) : view === 'SCHEDULE' ? (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="bento-card p-4">
            <div className="mb-3 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <CalendarClock size={16} className="text-sky-600 dark:text-sky-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Lịch Đã Xác Nhận
              </h3>
            </div>
            <div className="space-y-2">
              {schedules.length === 0 && (
                <p className="py-8 text-center text-xs font-mono text-slate-400">Chưa có lịch điều phối.</p>
              )}
              {schedules.slice().sort((left, right) => left.startAt.localeCompare(right.startAt)).map((schedule) => (
                <div key={schedule.id} className="flex items-center gap-3 border-l-2 border-l-sky-600 bg-slate-50/60 dark:bg-slate-900/40 p-3 border border-slate-200 dark:border-slate-800">
                  <div className="min-w-32 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                    {new Date(schedule.startAt).toLocaleString('vi-VN')}<br />
                    → {new Date(schedule.endAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div>
                    <strong className="text-xs text-slate-900 dark:text-white">{schedule.title}</strong>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{schedule.userName}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-4">
            <form onSubmit={handleCreateSchedule} className="space-y-2.5 bento-card p-4">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <ClipboardList size={16} className="text-sky-600 dark:text-sky-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Thêm Lịch Mới
                </h3>
              </div>
              <input
                required
                value={scheduleTitle}
                onChange={(event) => setScheduleTitle(event.target.value)}
                placeholder="Tên ca trực / nhiệm vụ sự kiện..."
                className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
              />
              <select
                value={scheduleUserId}
                onChange={(event) => setScheduleUserId(event.target.value)}
                className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900 px-2 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-mono"
              >
                {members.map((member) => (
                  <option key={member.id} value={member.id}>{member.name} ({member.subBranchCode})</option>
                ))}
              </select>
              <input
                required
                type="datetime-local"
                value={scheduleStart}
                onChange={(event) => setScheduleStart(event.target.value)}
                className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900 px-2 py-1.5 text-xs font-mono text-slate-800 dark:text-slate-200"
              />
              <input
                required
                type="datetime-local"
                value={scheduleEnd}
                onChange={(event) => setScheduleEnd(event.target.value)}
                className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900 px-2 py-1.5 text-xs font-mono text-slate-800 dark:text-slate-200"
              />
              {scheduleError && (
                <p className="flex gap-1 border border-rose-200 bg-rose-50 dark:bg-rose-950/40 p-2 text-[11px] text-rose-700 dark:text-rose-400">
                  <TriangleAlert size={14} className="shrink-0" />
                  {scheduleError}
                </p>
              )}
              <button
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-700 px-3 py-2 text-xs font-mono font-bold uppercase text-white transition-colors"
              >
                Kiểm tra & Xác nhận lịch
              </button>
            </form>

            <section className="bento-card p-4">
              <div className="mb-3 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Tải Nhân Sự Tác Chiến
                </h3>
              </div>
              {workloadByMember.slice(0, 6).map(({ member, count }) => (
                <div key={member.id} className="mb-2 flex items-center justify-between text-xs font-mono">
                  <span className="truncate text-slate-700 dark:text-slate-300">{member.name} ({member.subBranchCode})</span>
                  <span className={`font-bold ${count >= 4 ? 'text-rose-600' : count >= 2 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {count} task
                  </span>
                </div>
              ))}
            </section>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <section className="bento-card p-4">
            <div className="mb-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <CalendarClock size={16} className="text-sky-600 dark:text-sky-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {view === 'TIMELINE' ? 'Timeline theo ca' : view === 'GANTT' ? 'Gantt tiến độ công việc' : 'Monthly workload grid'}
                </h3>
              </div>
              <span className="font-mono text-[10px] text-slate-400">
                {view === 'GRID' ? 'THÁNG HIỆN TẠI' : 'OPERATIONS VIEW'}
              </span>
            </div>

            {view === 'TIMELINE' && (
              <div className="space-y-2">
                {schedules.length === 0 ? (
                  <p className="py-8 text-center text-xs font-mono text-slate-400">Chưa có mốc timeline.</p>
                ) : (
                  schedules.slice().sort((a, b) => a.startAt.localeCompare(b.startAt)).map((schedule) => (
                    <div key={schedule.id} className="grid grid-cols-[110px_12px_1fr] items-center gap-3">
                      <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                        {new Date(schedule.startAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="h-2 w-2 rounded-full bg-sky-600 ring-2 ring-sky-100 dark:ring-sky-950" />
                      <div className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-2.5">
                        <strong className="text-xs text-slate-900 dark:text-white">{schedule.title}</strong>
                        <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                          {schedule.userName} · Kết thúc {new Date(schedule.endAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {view === 'GANTT' && (
              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <p className="py-8 text-center text-xs font-mono text-slate-400">Chưa có task để lập Gantt.</p>
                ) : (
                  tasks.map((task, index) => (
                    <div key={task.id} className="grid grid-cols-[150px_1fr] items-center gap-3">
                      <div className="truncate text-xs font-semibold text-slate-700 dark:text-slate-300">{task.title}</div>
                      <div className="h-6 overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <div
                          className={`flex h-full items-center px-2 text-[10px] font-mono font-bold text-white ${
                            task.status === 'DONE' ? 'bg-emerald-600' : task.priority === 'URGENT' ? 'bg-rose-600' : 'bg-sky-600'
                          }`}
                          style={{ width: `${Math.max(20, Math.min(100, 30 + index * 12))}%` }}
                        >
                          {task.status}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {view === 'GRID' && (
              <div className="grid grid-cols-7 gap-px border border-slate-200 dark:border-slate-800 bg-slate-200 dark:bg-slate-800">
                {Array.from({ length: 35 }, (_, index) => {
                  const day = index - 2;
                  const load = schedules.filter((schedule) => new Date(schedule.startAt).getDate() === day).length + tasks.filter((task) => task.dueDate && new Date(task.dueDate).getDate() === day).length;
                  return (
                    <div key={index} className="min-h-20 bg-white dark:bg-[#090D16] p-2 border-t-2 border-slate-200 dark:border-slate-800">
                      <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">{day > 0 && day <= 31 ? day : ''}</span>
                      {load > 0 && (
                        <span className="mt-2 block text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400">
                          {load} hoạt động
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Split-View Drawer for Task Details */}
      {selectedTask && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090D16] p-5 shadow-2xl animate-drawer flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">
                  Task Drawer
                </p>
                <h3 className="mt-0.5 text-base font-bold text-slate-900 dark:text-white">Chi tiết công việc</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTaskId(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white border border-slate-200 dark:border-slate-800"
                title="Đóng"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 pt-4 text-xs">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{selectedTask.title}</h4>
                <p className="mt-2 leading-relaxed text-slate-500 dark:text-slate-400">
                  {selectedTask.description || 'Chưa có mô tả chi tiết. Vui lòng bổ sung SOP hoặc danh mục kiểm tra nếu cần.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono">
                <div className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-2">
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase">Ưu tiên</span>
                  <strong className="text-xs text-slate-900 dark:text-white">{selectedTask.priority}</strong>
                </div>
                <div className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-2">
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase">Điểm thưởng</span>
                  <strong className="text-xs text-emerald-600 dark:text-emerald-400">+{selectedTask.pointsReward} pts</strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Trạng thái
                </label>
                <select
                  value={selectedTask.status}
                  onChange={(event) => onMoveTask(selectedTask.id, event.target.value as TaskStatus)}
                  className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-mono"
                >
                  <option value="BACKLOG">Backlog</option>
                  <option value="TODO">To-do</option>
                  <option value="IN_PROGRESS">Đang làm</option>
                  <option value="IN_REVIEW">Chờ duyệt</option>
                  <option value="DONE">Hoàn thành</option>
                </select>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 p-3 font-mono">
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase">Phụ trách</span>
                <strong className="text-slate-900 dark:text-white text-xs">{selectedTask.assigneeName || 'Chưa giao'}</strong>
                {selectedTask.dueDate && (
                  <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                    Deadline: {new Date(selectedTask.dueDate).toLocaleString('vi-VN')}
                  </p>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedTaskId(null)}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-mono font-bold uppercase transition-colors"
          >
            Đóng Chi Tiết
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskScheduleTab;