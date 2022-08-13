//go:build wireinject
// +build wireinject

// The build tag makes sure the stub is not built in the final build.

package app

import (
	"github.com/google/wire"

	"github.com/morezig/teambuy_admin/v8/internal/app/api"
	"github.com/morezig/teambuy_admin/v8/internal/app/dao"
	"github.com/morezig/teambuy_admin/v8/internal/app/module/adapter"
	"github.com/morezig/teambuy_admin/v8/internal/app/router"
	"github.com/morezig/teambuy_admin/v8/internal/app/service"
)

func BuildInjector() (*Injector, func(), error) {
	wire.Build(
		InitGormDB,
		dao.RepoSet,
		InitAuth,
		InitCasbin,
		InitGinEngine,
		service.ServiceSet,
		api.APISet,
		router.RouterSet,
		adapter.CasbinAdapterSet,
		InjectorSet,
	)
	return new(Injector), nil, nil
}
