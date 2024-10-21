// run with tsx src/migrations/deleteSafeDeletedTasks.ts
import { connectDB } from '@/lib/mongodb';
import { Task, Group, Comment, UserPlan } from '@/lib/models';

async function deleteIsDeletedTrueData(dryRun = false) {
  await connectDB();

  const taskQuery = { isDeleted: true };
  const groupQuery = { isDeleted: true };
  const commentQuery = { isDeleted: true };
  const userPlanQuery = { isDeleted: true };

  if (dryRun) {
    const taskCount = await Task.countDocuments(taskQuery);
    const groupCount = await Group.countDocuments(groupQuery);
    const commentCount = await Comment.countDocuments(commentQuery);
    const userPlanCount = await UserPlan.countDocuments(userPlanQuery);
    console.log(`Dry run: ${taskCount} safe deleted tasks, ${groupCount} groups, ${commentCount} comments, and ${userPlanCount} user plans would be deleted.`);
  } else {
    const taskResult = await Task.deleteMany(taskQuery);
    const groupResult = await Group.deleteMany(groupQuery);
    const commentResult = await Comment.deleteMany(commentQuery);
    const userPlanResult = await UserPlan.deleteMany(userPlanQuery);
    console.log(`${taskResult.deletedCount} safe deleted tasks, ${groupResult.deletedCount} groups, ${commentResult.deletedCount} comments, and ${userPlanResult.deletedCount} user plans were deleted successfully.`);
  }

  process.exit(0);
}

// Call the function with dryRun parameter as needed
deleteIsDeletedTrueData(false).catch((error) => {
  console.error(error);
  process.exit(1);
});
