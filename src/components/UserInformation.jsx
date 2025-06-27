const UserInformation = ({ onContinue, updateData, data }) => {
  const handleInputChange = (field, value) => {
    updateData({
      userInfo: {
        ...data.userInfo,
        [field]: value,
      },
    });
  };

  const isFormValid = () => {
    const { name, mobile, email } = data.userInfo;
    return name && mobile && email;
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">معلوماتك</h2>
        <button className="text-gray-500 hover:text-gray-700">←</button>
      </div>

      <div className="space-y-4 mb-6">
        {/* First Name */}
        <div>
          <label className="block text-gray-700 mb-2 font-medium">
            الاسم الأول*
          </label>
          <input
            type="text"
            placeholder="ahmed123"
            value={data.userInfo.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-gray-700 mb-2 font-medium">
            الاسم الثاني*
          </label>
          <input
            type="text"
            placeholder="ahmed123"
            value={data.userInfo.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Mobile */}
        <div>
          <label className="block text-gray-700 mb-2 font-medium">
            موبايل*
          </label>
          <div className="flex">
            <select className="border border-gray-300 rounded-r-lg px-3 py-3 bg-gray-50">
              <option>🇸🇦 +966</option>
            </select>
            <input
              type="tel"
              placeholder="501449530"
              value={data.userInfo.mobile}
              onChange={(e) => handleInputChange("mobile", e.target.value)}
              className="flex-1 p-3 border-t border-b border-l border-gray-300 rounded-l-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <p className="text-xs text-red-500 mt-1">يجب إدخال رقم الموبايل</p>
        </div>

        {/* Email */}
        <div>
          <label className="block text-gray-700 mb-2 font-medium">
            البريد الإلكتروني*
          </label>
          <input
            type="email"
            placeholder="ahmed@gmail.com"
            value={data.userInfo.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Checkbox */}
        <div className="flex items-center space-x-2 space-x-reverse">
          <input type="checkbox" id="terms" className="h-4 w-4 text-blue-600" />
          <label htmlFor="terms" className="text-sm text-gray-600">
            أعتقد أن هذا موعد آخر
          </label>
        </div>
      </div>

      <button
        onClick={onContinue}
        disabled={!isFormValid()}
        className={`w-full py-3 rounded-lg font-medium transition-all ${
          isFormValid()
            ? "bg-gray-800 text-white hover:bg-gray-700"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        استمر
      </button>
    </div>
  );
};

export default UserInformation;
