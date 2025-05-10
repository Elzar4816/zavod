package authorizer

import (
	"github.com/casbin/casbin/v2"
)

func NewEnforcer() (*casbin.Enforcer, error) {
	return casbin.NewEnforcer("authorizer/model.conf", "authorizer/policy.csv")
}
