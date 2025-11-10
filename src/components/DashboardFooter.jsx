const DashboardFooter = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-gray-400">
          <p className="text-sm">&copy; {new Date().getFullYear()} JNU Circle. All rights reserved.</p>
          <p className="text-sm mt-1">
            Made with <span className="text-red-500">❤️</span> for JNU students
          </p>
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;
