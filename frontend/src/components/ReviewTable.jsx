function ReviewTable({ reviews }) {
  return (
    <div className="overflow-hidden rounded-xl shadow-lg border border-gray-200">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-100">
            {["User", "Product", "Review", "Contact", "Timestamp"].map((col) => (
              <th
                key={col}
                className="py-3 px-4 text-left text-sm font-medium text-gray-700"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reviews?.length ? (
            reviews.map((item, index) => (
              <tr
                key={item.id || index}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="py-3 px-4 text-sm">{item.user_name}</td>
                <td className="py-3 px-4 text-sm font-medium text-gray-900">
                  {item.product_name}
                </td>
                <td className="py-3 px-4 text-sm">{item.product_review}</td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {item.contact_number}
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">
                  {new Date(item.created_at).toLocaleString()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="5"
                className="py-5 px-4 text-center text-gray-500 italic"
              >
                No reviews yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ReviewTable;
