import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { TaskForm } from "./TaskForm";
import { TaskList } from "./TaskList";
import { RewardSystem } from "./RewardSystem";
import { MemoryFeature } from "./MemoryFeature";
import { toast } from "sonner";

interface TaskManagerProps {
  isHorrorMode: boolean;
}

export function TaskManager({ isHorrorMode }: TaskManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const tasks = useQuery(api.tasks.getTasks) || [];
  const toggleTask = useMutation(api.tasks.toggleTask);
  const deleteTask = useMutation(api.tasks.deleteTask);

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);
  const overdueTasks = pendingTasks.filter(task => 
    task.dueDate && task.dueDate < Date.now()
  );

  const handleToggleTask = async (taskId: Id<"tasks">) => {
    try {
      await toggleTask({ taskId });
      toast.success(isHorrorMode ? "👻 Task conquered, Bebu!" : "🎉 Amazing work, Bebu!", {
        description: isHorrorMode ? "The spooky spirits are proud!" : "You're absolutely crushing it! 💖"
      });
    } catch (error) {
      toast.error("Oops! Something went wrong, sweetie 💔");
    }
  };

  const handleDeleteTask = async (taskId: Id<"tasks">) => {
    try {
      await deleteTask({ taskId });
      toast.success(isHorrorMode ? "🕷️ Task banished!" : "✨ Task deleted, darling!");
    } catch (error) {
      toast.error("Couldn't delete that, Bebu 😢");
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-3xl shadow-xl transition-all duration-500 hover:scale-105 transform ${
          isHorrorMode
            ? 'bg-gradient-to-br from-purple-800/60 to-purple-900/60 border-2 border-red-600/40 shadow-red-900/30'
            : 'bg-white/10 border-2 border-pink-300/40 shadow-pink-300/20'
        } backdrop-blur-xl`}>
          <div className="text-center">
            <div className="text-4xl mb-3 animate-bounce">{isHorrorMode ? '👻' : '📝'}</div>
            <div className={`text-3xl font-bold mb-1 ${isHorrorMode ? 'text-red-300' : 'text-pink-600'}`}>
              {pendingTasks.length}
            </div>
            <div className={`text-sm font-medium ${isHorrorMode ? 'text-purple-200' : 'text-purple-600'}`}>
              {isHorrorMode ? 'Spooky Tasks' : 'Sweet Tasks'}
            </div>
            <div className="flex justify-center gap-1 mt-2">
              <span className="text-lg animate-pulse">✨</span>
              <span className="text-lg animate-bounce">💕</span>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-3xl shadow-xl transition-all duration-500 hover:scale-105 transform ${
          isHorrorMode
            ? 'bg-gradient-to-br from-red-900/60 to-red-800/60 border-2 border-red-600/60 shadow-red-900/50'
            : 'bg-white/10 border-2 border-orange-300/40 shadow-orange-300/20'
        } backdrop-blur-xl`}>
          <div className="text-center">
            <div className="text-4xl mb-3 animate-pulse">{isHorrorMode ? '💀' : '⚠️'}</div>
            <div className={`text-3xl font-bold mb-1 ${isHorrorMode ? 'text-red-200 animate-pulse' : 'text-orange-500'}`}>
              {overdueTasks.length}
            </div>
            <div className={`text-sm font-medium ${isHorrorMode ? 'text-red-300' : 'text-orange-600'}`}>
              {isHorrorMode ? 'Ghostly Overdue' : 'Gentle Reminders'}
            </div>
            <div className="flex justify-center gap-1 mt-2">
              <span className="text-lg animate-bounce">🔔</span>
              <span className="text-lg animate-pulse">⏰</span>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-3xl shadow-xl transition-all duration-500 hover:scale-105 transform ${
          isHorrorMode
            ? 'bg-gradient-to-br from-green-900/60 to-green-800/60 border-2 border-green-600/40 shadow-green-900/30'
            : 'bg-white/10 border-2 border-green-300/40 shadow-green-300/20'
        } backdrop-blur-xl`}>
          <div className="text-center">
            <div className="text-4xl mb-3 animate-bounce">{isHorrorMode ? '🎃' : '✅'}</div>
            <div className={`text-3xl font-bold mb-1 ${isHorrorMode ? 'text-green-300' : 'text-green-600'}`}>
              {completedTasks.length}
            </div>
            <div className={`text-sm font-medium ${isHorrorMode ? 'text-green-200' : 'text-green-600'}`}>
              {isHorrorMode ? 'Victorious!' : 'Accomplished!'}
            </div>
            <div className="flex justify-center gap-1 mt-2">
              <span className="text-lg animate-pulse">🎉</span>
              <span className="text-lg animate-bounce">🏆</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Button */}
      <div className="text-center">
        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-8 py-4 rounded-full font-bold text-lg shadow-lg transform transition-all duration-300 hover:scale-105 ${
            isHorrorMode
              ? 'bg-gradient-to-r from-purple-600 to-red-600 text-white hover:from-purple-500 hover:to-red-500 shadow-red-900/50'
              : 'bg-gradient-to-r from-pink-400 to-purple-400 text-white hover:from-pink-300 hover:to-purple-300 shadow-pink-300/50'
          }`}
        >
          <span className="mr-2">{isHorrorMode ? '🕸️' : '✨'}</span>
          {showForm ? 'Hide Form' : 'Add New Task'}
          <span className="ml-2">{isHorrorMode ? '🦇' : '💖'}</span>
        </button>
      </div>

      {/* Task Form */}
      {showForm && (
        <div className={`p-6 rounded-2xl shadow-xl transition-all duration-500 ${
          isHorrorMode
            ? 'bg-purple-900/70 border border-red-600/50'
            : 'bg-white/10 border border-pink-300/40'
        } backdrop-blur-xl`}>
          <TaskForm
            isHorrorMode={isHorrorMode}
            onSuccess={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Day Summary */}
      <div className={`p-6 rounded-2xl shadow-xl transition-all duration-500 ${
        isHorrorMode
          ? 'bg-purple-900/70 border border-red-600/50'
          : 'bg-white/10 border border-pink-300/40'
      } backdrop-blur-xl`}>
        <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
          isHorrorMode ? 'text-red-200' : 'text-pink-700'
        }`}>
          <span className="text-2xl">{isHorrorMode ? '🌙' : '📊'}</span>
          {isHorrorMode ? 'Day Overview' : 'Day Summary'}
          <span className="text-2xl">{isHorrorMode ? '👻' : '✨'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${
            isHorrorMode ? 'bg-red-900/50' : 'bg-blue-50/30'
          }`}>
            <h4 className={`font-semibold mb-2 ${isHorrorMode ? 'text-red-200' : 'text-blue-700'}`}>
              {isHorrorMode ? '🕸️ Today\'s Focus' : '🎯 Today\'s Focus'}
            </h4>
            <p className={`text-sm ${isHorrorMode ? 'text-purple-300' : 'text-blue-600'}`}>
              {pendingTasks.length > 0
                ? `${pendingTasks.length} task${pendingTasks.length !== 1 ? 's' : ''} to conquer today!`
                : isHorrorMode ? 'All tasks completed! The spirits are pleased.' : 'All caught up! Time to relax! 🌸'
              }
            </p>
          </div>

          <div className={`p-4 rounded-lg ${
            isHorrorMode ? 'bg-green-900/50' : 'bg-green-50/30'
          }`}>
            <h4 className={`font-semibold mb-2 ${isHorrorMode ? 'text-green-200' : 'text-green-700'}`}>
              {isHorrorMode ? '🎃 Progress' : '📈 Progress'}
            </h4>
            <p className={`text-sm ${isHorrorMode ? 'text-green-300' : 'text-green-600'}`}>
              {tasks.length > 0
                ? `${Math.round((completedTasks.length / tasks.length) * 100)}% complete - ${completedTasks.length} of ${tasks.length} tasks done!`
                : 'No tasks yet today.'
              }
            </p>
          </div>
        </div>

        {overdueTasks.length > 0 && (
          <div className={`mt-4 p-4 rounded-lg ${
            isHorrorMode ? 'bg-red-900/50 border border-red-500' : 'bg-red-50/30 border border-red-300'
          }`}>
            <h4 className={`font-semibold mb-2 ${isHorrorMode ? 'text-red-200' : 'text-red-700'}`}>
              {isHorrorMode ? '💀 Urgent Attention Needed' : '⚠️ Needs Attention'}
            </h4>
            <p className={`text-sm ${isHorrorMode ? 'text-red-300' : 'text-red-600'}`}>
              {overdueTasks.length} overdue task{overdueTasks.length !== 1 ? 's' : ''} - let's get these done!
            </p>
          </div>
        )}
      </div>

      {/* Task Lists */}
      <div className="space-y-6">
        {overdueTasks.length > 0 && (
          <div className={`p-6 rounded-2xl shadow-xl border-2 ${
            isHorrorMode
              ? 'bg-red-900/70 border-red-500 animate-pulse'
              : 'bg-red-50/30 border-red-300/60 backdrop-blur-sm'
          }`}>
            <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
              isHorrorMode ? 'text-red-200' : 'text-red-700'
            }`}>
              <span className="text-2xl">{isHorrorMode ? '💀' : '⚠️'}</span>
              {isHorrorMode ? 'Spooky Overdue Tasks!' : 'Overdue Tasks, Bebu!'}
              <span className="text-2xl">{isHorrorMode ? '👻' : '⚠️'}</span>
            </h3>
            <TaskList
              tasks={overdueTasks}
              isHorrorMode={isHorrorMode}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
            />
          </div>
        )}

        {pendingTasks.filter(task => !overdueTasks.includes(task)).length > 0 && (
          <div className={`p-6 rounded-2xl shadow-xl ${
            isHorrorMode
              ? 'bg-purple-800/70 border border-purple-600/50'
              : 'bg-white/10 border border-pink-300/40 backdrop-blur-xl'
          }`}>
            <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
              isHorrorMode ? 'text-purple-200' : 'text-pink-700'
            }`}>
              <span className="text-2xl">{isHorrorMode ? '🕷️' : '📋'}</span>
              {isHorrorMode ? 'Pending Spells' : 'Pending Tasks'}
              <span className="text-2xl">{isHorrorMode ? '🦇' : '✨'}</span>
            </h3>
            <TaskList
              tasks={pendingTasks.filter(task => !overdueTasks.includes(task))}
              isHorrorMode={isHorrorMode}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
            />
          </div>
        )}

        {completedTasks.length > 0 && (
          <div className={`p-6 rounded-2xl shadow-xl ${
            isHorrorMode
              ? 'bg-green-900/70 border border-green-600/50'
              : 'bg-green-50/30 border border-green-300/60 backdrop-blur-sm'
          }`}>
            <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
              isHorrorMode ? 'text-green-200' : 'text-green-700'
            }`}>
              <span className="text-2xl">{isHorrorMode ? '🎃' : '🎉'}</span>
              {isHorrorMode ? 'Conquered Tasks!' : 'Completed Tasks!'}
              <span className="text-2xl">{isHorrorMode ? '👑' : '💖'}</span>
            </h3>
            <TaskList
              tasks={completedTasks}
              isHorrorMode={isHorrorMode}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
            />
          </div>
        )}
      </div>

      {/* Reward System */}
      <div className={`p-6 rounded-2xl shadow-xl transition-all duration-500 ${
        isHorrorMode
          ? 'bg-purple-900/70 border border-red-600/50'
          : 'bg-white/10 border border-pink-300/40'
      } backdrop-blur-xl`}>
        <RewardSystem isHorrorMode={isHorrorMode} />
      </div>

      {/* Memory Feature */}
      <div className={`p-6 rounded-2xl shadow-xl transition-all duration-500 ${
        isHorrorMode
          ? 'bg-purple-900/70 border border-red-600/50'
          : 'bg-white/10 border border-pink-300/40'
      } backdrop-blur-xl`}>
        <MemoryFeature isHorrorMode={isHorrorMode} />
      </div>

      {tasks.length === 0 && (
        <div className={`text-center p-12 rounded-2xl ${
          isHorrorMode
            ? 'bg-purple-800/50 text-purple-200'
            : 'bg-pink-50/30 text-pink-600 backdrop-blur-sm'
        }`}>
          <div className="text-6xl mb-4">{isHorrorMode ? '🕸️' : '🌸'}</div>
          <h3 className="text-2xl font-bold mb-2">
            {isHorrorMode ? 'No tasks in the haunted mansion!' : 'No tasks yet, beautiful!'}
          </h3>
          <p className="text-lg">
            {isHorrorMode ? 'Add some spooky reminders to get started! 👻' : 'Add your first task and let the magic begin! ✨'}
          </p>
        </div>
      )}
    </div>
  );
}
