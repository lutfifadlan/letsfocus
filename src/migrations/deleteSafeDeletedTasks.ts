import { connectDB } from '@/lib/mongodb';
import { Task } from '@/lib/models';

async function deleteSafeDeletedTasks(dryRun = false) {
  await connectDB();

  const query = { isDeleted: true };

  if (dryRun) {
    const count = await Task.countDocuments(query);
    console.log(`Dry run: ${count} safe deleted tasks would be deleted.`);
  } else {
    const result = await Task.deleteMany(query);
    console.log(`${result.deletedCount} safe deleted tasks were deleted successfully.`);
  }

  process.exit(0);
}

// Call the function with dryRun parameter as needed
deleteSafeDeletedTasks(true).catch((error) => {
  console.error(error);
  process.exit(1);
});