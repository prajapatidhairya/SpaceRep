import { FormEvent, useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
  differenceInCalendarDays,
} from 'date-fns';

type Tab = 'dashboard' | 'calendar' | 'goals';

type Goal = {
  id: number;
  name: string;
  date: string;
};

const today = new Date();

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(today));
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalName, setGoalName] = useState('');
  const [goalDate, setGoalDate] = useState(format(today, 'yyyy-MM-dd'));

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const goalCountdowns = useMemo(
    () =>
      goals.map((goal) => {
        const remaining = differenceInCalendarDays(new Date(goal.date), today);
        return { ...goal, remaining };
      }),
    [goals],
  );

  const addGoal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!goalName.trim()) return;

    setGoals((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: goalName.trim(),
        date: goalDate,
      },
    ]);

    setGoalName('');
  };

  return (
    <main className="app-shell">
      <header className="header">
        <h1>SpaceRep</h1>
        <nav className="tabs">
          {(['dashboard', 'calendar', 'goals'] as const).map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? 'tab active' : 'tab'}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tab[0].toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </header>

      {activeTab === 'dashboard' && (
        <section className="card-grid">
          <article className="card">
            <h2>Today</h2>
            <p className="big">{format(today, 'EEEE')}</p>
            <p>{format(today, 'MMMM d, yyyy')}</p>
          </article>

          <article className="card wide">
            <h2>Goal Countdown</h2>
            {goalCountdowns.length === 0 ? (
              <p>No goals yet. Add one in the Goals tab.</p>
            ) : (
              <ul className="goal-list">
                {goalCountdowns.map((goal) => (
                  <li key={goal.id}>
                    <strong>{goal.name}</strong>
                    <span>
                      {goal.remaining >= 0
                        ? `${goal.remaining} day${goal.remaining === 1 ? '' : 's'} remaining`
                        : `${Math.abs(goal.remaining)} day${Math.abs(goal.remaining) === 1 ? '' : 's'} ago`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>
      )}

      {activeTab === 'calendar' && (
        <section className="calendar-panel card">
          <div className="calendar-controls">
            <button type="button" onClick={() => setCurrentMonth((month) => subMonths(month, 1))}>
              Previous
            </button>
            <h2>{format(currentMonth, 'MMMM yyyy')}</h2>
            <button type="button" onClick={() => setCurrentMonth((month) => addMonths(month, 1))}>
              Next
            </button>
          </div>
          <button
            type="button"
            className="today-btn"
            onClick={() => setCurrentMonth(startOfMonth(today))}
          >
            Jump to Today
          </button>

          <div className="calendar-grid labels">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="calendar-grid">
            {calendarDays.map((day) => (
              <div
                key={day.toISOString()}
                className={[
                  'day-cell',
                  !isSameMonth(day, currentMonth) ? 'muted' : '',
                  isSameDay(day, today) ? 'today-cell' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {format(day, 'd')}
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'goals' && (
        <section className="card goals-panel">
          <h2>Add a Goal</h2>
          <form onSubmit={addGoal} className="goal-form">
            <label>
              Goal name
              <input
                type="text"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder="Run first 10K"
                required
              />
            </label>

            <label>
              Goal date
              <input
                type="date"
                value={goalDate}
                onChange={(e) => setGoalDate(e.target.value)}
                required
              />
            </label>

            <button type="submit">Save goal</button>
          </form>

          <h3>Saved Goals</h3>
          {goals.length === 0 ? (
            <p>No goals saved.</p>
          ) : (
            <ul className="goal-list">
              {goals.map((goal) => (
                <li key={goal.id}>
                  <strong>{goal.name}</strong>
                  <span>{format(new Date(goal.date), 'MMMM d, yyyy')}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}
