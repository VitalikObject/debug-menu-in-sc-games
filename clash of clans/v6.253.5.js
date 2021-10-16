var base = Module.findBaseAddress("libg.so");
var mallocPtr = Module.findExportByName("libc.so", "malloc");
var DebugMenuCtorPtr = 0x0064C30 + 1;
var LevelMenuCtorPtr = 0x0067B98 + 1;
var EffectPreviewCtorPtr = 0x0067824 + 1;
var ResourceListenerAddFilePtr = 0x00CCD8C + 1;
var StageAddChildPtr = 0x014D4D6 + 1;
var StringCtorPtr = 0x0129EFC + 1;
var StringDestructorPtr = 0x0129BB4 + 1;
var DebugMenuBaseUpdatePtr = 0x0065520 + 1;
var StageRemoveChildPtr = 0x014D4E4 + 1;
var DisplayObjectSetSizePtr = 0x014AA90 + 1;

var malloc = new NativeFunction(mallocPtr, 'pointer', ['int']);
var fDebugMenuCtor = new NativeFunction(base.add(DebugMenuCtorPtr), "pointer", ["pointer", "int", "int"]);
var fLevelMenuCtor = new NativeFunction(base.add(LevelMenuCtorPtr), "pointer", ["pointer", "int"]);
var fEffectPreviewCtor = new NativeFunction(base.add(EffectPreviewCtorPtr), "pointer", ["pointer"]);
var fResourceListenerAddFile = new NativeFunction(base.add(ResourceListenerAddFilePtr), "void", ["pointer", "pointer", "pointer"]);
var fStageAddChild = new NativeFunction(base.add(StageAddChildPtr), "int", ["pointer", "pointer"]);
var fStringCtor = new NativeFunction(base.add(StringCtorPtr, "void", ["pointer", "pointer"]));
var fStringDestructor = new NativeFunction(base.add(StringDestructorPtr), "pointer", ["pointer"]);
var fDebugMenuBaseUpdate = new NativeFunction(base.add(DebugMenuBaseUpdatePtr), "int", ["pointer", "float"]);
var fStageRemoveChild = new NativeFunction(base.add(StageRemoveChildPtr), "int", ["pointer", "pointer"]);
var fDisplayObjectSetSize = new NativeFunction(base.add(DisplayObjectSetSizePtr), "int", ["pointer", "float", "float"]);
var leave = 0;
var dptr = malloc(228);
var stage_address; 
var debugmenutype;
var StringPtr = malloc(32);
ptr(base.add(0x02F92AA)).writeU8(1);
var load = Interceptor.attach(ptr(base.add(0x00BB2FD)), {
	onEnter: function(args) {
		load.detach();
		fStringCtor(StringPtr, ptr(base.add(0x026369D)));
		fResourceListenerAddFile(Memory.readPointer(base.add(0x02F7C68)), ptr(StringPtr), ptr(args[1]));
		fStringDestructor(StringPtr);
		console.log("debug.sc loaded");
	}
});
var stage = Interceptor.attach(ptr(base.add(0x014F701)), {
	onEnter: function(args) {
		stage.detach();
		console.log("In Stage!");
		stage_address = args[0];
	}
});
var gameWasLoaded = Interceptor.attach(ptr(base.add(0x008A5E5)), {
    onEnter: function(args) {
		gameWasLoaded.detach();
		console.log("debug menu called");
		fStageAddChild(stage_address, fDebugMenuCtor(dptr, 0, 0));
		debugmenutype = 0;
    }
});
var hudUpdate = Interceptor.attach(ptr(base.add(0x0086901)), {
	onEnter: function(args) {
		fDebugMenuBaseUpdate(dptr, 20);
	}
});	
var levelButton = Interceptor.attach(ptr(base.add(0x0067F91)), {
	onEnter: function(args) {
		if (debugmenutype === 0) {
			console.log("Level Button pressed");
			fDisplayObjectSetSize(fDebugMenuCtor(dptr, 0, 0), 0, 0);
			fStageRemoveChild(stage_address, fDebugMenuCtor(dptr, 0, 0));
			fStageAddChild(stage_address, fLevelMenuCtor(dptr, 0));
			debugmenutype = 1;
		}
	}
});	
var effectButton = Interceptor.attach(ptr(base.add(0x00679C1)), {
	onEnter: function(args) {
		if(debugmenutype === 0) {
			console.log("Effect Button pressed");
			fDisplayObjectSetSize(fDebugMenuCtor(dptr, 0, 0), 0, 0);
			fStageRemoveChild(stage_address, fDebugMenuCtor(dptr, 0, 0));
			fStageAddChild(stage_address, fEffectPreviewCtor(dptr));
			debugmenutype = 2;
		}
	}
});			
var ExitDebug = Interceptor.attach(ptr(base.add(0x00686A9)), {
	onEnter: function(args) {
		console.log("Exit Button pressed");
		switch(debugmenutype) {
			case 0:
				fDisplayObjectSetSize(fDebugMenuCtor(dptr, 0, 0), 0, 0);
			break;
			case 1:
				fDisplayObjectSetSize(fLevelMenuCtor(dptr, 0), 0, 0);
				fStageRemoveChild(stage_address, fLevelMenuCtor(dptr, 0));
				fStageAddChild(stage_address, fDebugMenuCtor(dptr, 0, 0));
				debugmenutype = 0;
			break;
			case 2:
				fDisplayObjectSetSize(fEffectPreviewCtor(dptr), 0, 0);
				fStageRemoveChild(stage_address, fEffectPreviewCtor(dptr));
				fStageAddChild(stage_address, fDebugMenuCtor(dptr, 0, 0));
				debugmenutype = 0;
			break;
		}
	}
});	
var sendMessageCtor = Interceptor.attach(ptr(base.add(0x00490E9)), {
	onEnter: function(args) {
		leave = 0;
		var ReadChatMessage = Interceptor.attach(StringCtorPtr, {
			onEnter: function(args) {
				if(args[1].readUtf8String() === "/menu") {
					fStageAddChild(stage_address, fDebugMenuCtor(dptr, 0, 0));
					ReadChatMessage.detach();
				}
				if(leave === 1) {
					ReadChatMessage.detach();
				}
			}
		});
	},
	onLeave: function(args) {
		leave = 1;
	}
});
