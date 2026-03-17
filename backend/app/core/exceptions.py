"""自定义异常类和全局异常处理."""

from fastapi import HTTPException, status


class OpenClawException(HTTPException):
    """应用基础异常类."""

    def __init__(
        self,
        status_code: int,
        detail: str,
        headers: dict[str, str] | None = None,
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)


class NotFoundException(OpenClawException):
    """资源不存在异常."""

    def __init__(self, resource: str = "资源"):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource}不存在",
        )


class UnauthorizedException(OpenClawException):
    """未授权异常."""

    def __init__(self, detail: str = "未授权"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


class ForbiddenException(OpenClawException):
    """禁止访问异常."""

    def __init__(self, detail: str = "禁止访问"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
        )


class BadRequestException(OpenClawException):
    """错误请求异常."""

    def __init__(self, detail: str = "请求参数错误"):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
        )


class ConflictException(OpenClawException):
    """资源冲突异常."""

    def __init__(self, detail: str = "资源已存在"):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
        )
