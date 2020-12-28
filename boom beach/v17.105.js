var base = Module.findBaseAddress("libg.so");
var mallocPtr = Module.findExportByName("libc.so", "malloc");
var DebugMenuCtorPtr = 0x003F830 + 1;
var LevelMenuCtorPtr = 0x0041C80 + 1;
var EffectPreviewCtorPtr = 0x004138C + 1;
var ResourceListenerAddFilePtr = 0x0123310 + 1;
var StageAddChildPtr = 0x01316DE + 1;
var DebugMenuBaseUpdatePtr = 0x003FD6C + 1;
var StageRemoveChildPtr = 0x01316EC + 1;
var StageCtorPtr = 0x0133908 + 1;
var GameModeAddResourcesToLoadPtr = 0x00AFD14 + 1;
var MoneyHudCtorPtr = 0x006DA8C + 1;
var HudUpdatePtr = 0x0069DFC + 1;
var LevelMenuButtonClickedPtr = 0x0041E60 + 1;
var EffectPreviewButtonButtonPressedPtr = 0x0041508 + 1;
var ToggleDebugMenuButtonButtonPressed = 0x00425A4 + 1;

var malloc = new NativeFunction(mallocPtr, 'pointer', ['int']);
var fDebugMenuCtor = new NativeFunction(base.add(DebugMenuCtorPtr), "void", ["pointer"]);
var fLevelMenuCtor = new NativeFunction(base.add(LevelMenuCtorPtr), "void", ["pointer", "int"]);
var fEffectPreviewCtor = new NativeFunction(base.add(EffectPreviewCtorPtr), "void", ["pointer"]);
var fResourceListenerAddFile = new NativeFunction(base.add(ResourceListenerAddFilePtr), "void", ["pointer", "pointer", "int", "int"]);
var fStageAddChild = new NativeFunction(base.add(StageAddChildPtr), "int", ["pointer", "pointer"]);
var fDebugMenuBaseUpdate = new NativeFunction(base.add(DebugMenuBaseUpdatePtr), "int", ["pointer", "float"]);
var fStageRemoveChild = new NativeFunction(base.add(StageRemoveChildPtr), "int", ["pointer", "pointer"]);

var dptr = malloc(1000);
var stage_address; 
var debugmenutype;
base.add(0x02D44E2).writeU8(1);

var load = Interceptor.attach(base.add(GameModeAddResourcesToLoadPtr), {
	onEnter: function(args) {
		load.detach();
		fResourceListenerAddFile(args[1], base.add(0x0245382), -1, -1);
		console.log("debug.sc loaded");
	}
});
var stage = Interceptor.attach(base.add(StageCtorPtr), {
	onEnter: function(args) {
		stage.detach();
		console.log("In Stage!");
		stage_address = args[0];
	}
});
var gameWasLoaded = Interceptor.attach(base.add(MoneyHudCtorPtr), {
    onEnter: function(args) {
		gameWasLoaded.detach();
		console.log("debug menu called");
		fDebugMenuCtor(dptr);
		debugmenutype = 0;
		fStageAddChild(stage_address, dptr);
    }
});
var hudUpdate = Interceptor.attach(base.add(HudUpdatePtr), {
	onEnter: function(args) {
		fDebugMenuBaseUpdate(dptr, 20);
	}
});
var levelButton = Interceptor.attach(base.add(LevelMenuButtonClickedPtr), {
	onEnter: function(args) {
		if (debugmenutype === 0) {
			console.log("Level Button pressed");
			fStageRemoveChild(stage_address, dptr);
			fLevelMenuCtor(dptr, 0);
			fStageAddChild(stage_address, dptr);
			debugmenutype = 1;
		}
	}
});	
var effectButton = Interceptor.attach(base.add(EffectPreviewButtonButtonPressedPtr), {
	onEnter: function(args) {
		if(debugmenutype === 0) {
			console.log("Effect Button pressed");
			fStageRemoveChild(stage_address, dptr);
			fEffectPreviewCtor(dptr);
			fStageAddChild(stage_address, dptr);
			debugmenutype = 2;
		}
	}
});	
var ExitDebug = Interceptor.attach(base.add(ToggleDebugMenuButtonButtonPressed), {
	onEnter: function(args) {
		console.log("Exit Button pressed");
		switch(debugmenutype) {
			case 0:
				fStageRemoveChild(stage_address, dptr);
			break;
			case 1:
				fStageRemoveChild(stage_address, dptr);
				fDebugMenuCtor(dptr)
				fStageAddChild(stage_address, dptr);
				debugmenutype = 0;
			break;
			case 2:
				fStageRemoveChild(stage_address, dptr);
				fDebugMenuCtor(dptr);
				fStageAddChild(stage_address, dptr);
				debugmenutype = 0;
			break;
		}
	}
});