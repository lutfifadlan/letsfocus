import { connectDB } from '@/lib/mongodb';
import { Task } from '@/lib/models';

async function migrateTaskOrder() {
  await connectDB();

  // Get all unique user IDs
  const userIds = await Task.distinct('userId');

  console.log(`Found ${userIds.length} users with tasks.`);

  for (const userId of userIds) {
    // Get all tasks for this user, sorted by createdAt
    const userTasks = await Task.find({ userId })
      .sort({ createdAt: 1 });

    console.log(`Updating order for ${userTasks.length} tasks of user ${userId}`);

    // Update the order for each task
    for (let i = 0; i < userTasks.length; i++) {
      await Task.updateOne(
        { _id: userTasks[i]._id },
        { $set: { order: i + 1 } }
      );
    }
  }

  console.log('Task order migration completed successfully.');
  process.exit(0); // Automatically close the program after execution
}

migrateTaskOrder().catch((error) => {
  console.error(error);
  process.exit(1); // Exit with an error code if there is an error
});