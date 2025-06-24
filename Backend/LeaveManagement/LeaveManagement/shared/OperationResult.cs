

namespace LeaveManagement.shared.OperationResult;

    public class OperationResult<T>
    {
        public bool IsSuccess { get; private set; }
        public string Message { get; private set; }
        public T? Data { get; private set; }

        private OperationResult(bool isSuccess, string message, T? data = default)
        {
            IsSuccess = isSuccess;
            Message = message;
            Data = data;
        }

        public static OperationResult<T> Success(T data, string message = "Operation succeeded")
        {
            return new OperationResult<T>(true, message, data);
        }

        public static OperationResult<T> Success(string message = "Operation succeeded")
        {
            return new OperationResult<T>(true, message);
        }

        public static OperationResult<T> Failure(string message)
        {
            return new OperationResult<T>(false, message);
        }

}
